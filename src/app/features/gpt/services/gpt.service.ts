import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concat, map, Observable, of, switchMap, catchError, merge, tap, scan } from 'rxjs';
import { NetworkPost } from '../interfaces/network-post.interface';
import { PLATFORMS } from '../constants/gpt.constants';

export interface ChatRequest {
  prompt: string;
  previousResponseId: string;
}

export interface ChatResponse {
  message: string;
  context: string;
  responseId: string;
  messageId: string;
}

export interface GeneratePostsRequest {
  prompt: string;
}

export interface GeneratePostsResponse {
  networks: Record<string, NetworkPost>;
  messageId: string;
}

export interface GenerateImageRequest {
  prompt: string;
  previousResponseId: string;
}

export interface GenerateImageResponse {
  url: string;
  responseId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GptService {
  private readonly BASE_URL = 'http://localhost:3000/gpt';
  private readonly CHAT_URL = `${this.BASE_URL}/chat`;
  private readonly GENERATE_POSTS_URL = `${this.BASE_URL}/generate-posts`;
  private readonly GENERATE_IMAGE_URL = `${this.BASE_URL}/generate-image`;
  private readonly VIDEO_GENERATE_URL = `${this.BASE_URL}/veo/generate`;
  private readonly VIDEO_STATUS_URL = `${this.BASE_URL}/veo/status`;

  private http: HttpClient = inject(HttpClient);

  sendMessage(prompt: string, previousResponseId: string = '', chatId?: string): Observable<ChatResponse> {
    const body: any = {
      prompt,
      previousResponseId
    };

    if (chatId) {
      body.chatId = chatId;
    }

    console.log('🔵 [GptService] Sending message:', body);

    return this.http.post<ChatResponse>(this.CHAT_URL, body).pipe(
      tap(response => console.log('✅ [GptService] Message response:', response))
    );
  }

  generatePosts(prompt: string): Observable<GeneratePostsResponse> {
    const body: GeneratePostsRequest = { prompt };
    return this.http.post<GeneratePostsResponse>(this.GENERATE_POSTS_URL, body);
  }

  generateImage(prompt: string, previousResponseId: string = '', messageId?: string): Observable<GenerateImageResponse> {
    const body: any = {
      prompt,
      previousResponseId
    };

    if (messageId) {
      body.messageId = messageId;
    }

    console.log('🔵 [GptService] Generating image:', body);

    return this.http.post<GenerateImageResponse>(this.GENERATE_IMAGE_URL, body).pipe(
      tap(response => console.log('✅ [GptService] Image generated:', response))
    );
  }

  startVideoGeneration(prompt: string, messageId?: string): Observable<{ operationId: string }> {
    const body: any = { prompt };

    if (messageId) {
      body.messageId = messageId;
    }

    console.log('🔵 [GptService] Starting video generation:', body);

    return this.http.post<{ operationId: string }>(this.VIDEO_GENERATE_URL, body).pipe(
      tap(response => console.log('✅ [GptService] Video generation started:', response))
    );
  }

  checkVideoStatus(operationId: string): Observable<{ status: string; url?: string }> {
    return this.http.get<{ status: string; url?: string }>(`${this.VIDEO_STATUS_URL}?id=${operationId}`);
  }

  generateVideo(prompt: string, messageId?: string): Observable<string> {
    return this.startVideoGeneration(prompt, messageId).pipe(
      switchMap(response => {
        const startTime = Date.now();
        const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

        return new Observable<string>(observer => {
          const pollInterval = setInterval(() => {
            // Check timeout
            if (Date.now() - startTime > TIMEOUT_MS) {
              clearInterval(pollInterval);
              console.error('Video generation timeout after 2 minutes');
              observer.error('Video generation timeout');
              return;
            }

            this.checkVideoStatus(response.operationId).subscribe({
              next: (statusResponse) => {
                if (statusResponse.status === 'COMPLETED' && statusResponse.url) {
                  clearInterval(pollInterval);
                  observer.next(statusResponse.url);
                  observer.complete();
                } else if (statusResponse.status === 'FAILED') {
                  clearInterval(pollInterval);
                  console.error('Video generation failed');
                  observer.error('Video generation failed');
                } else if (statusResponse.status === 'RUNNING') {
                  // Continue polling
                  console.log('Video generation in progress...');
                }
              },
              error: (err) => {
                clearInterval(pollInterval);
                console.error('Error checking video status:', err);
                observer.error(err);
              }
            });
          }, 15000); // Poll every 15 seconds

          return () => clearInterval(pollInterval);
        });
      })
    );
  }

  /**
   * Genera publicaciones para redes sociales y, si es necesario, la imagen para Instagram y video para TikTok.
   * Emite actualizaciones progresivas a medida que se completa la generación de medios.
   * @param context - Contexto para generar los posts
   * @param messageId - Optional message ID to associate media with
   */
  generateSocialContent(context: string, messageId?: string): Observable<NetworkPost[]> {
    console.log('🔵 [GptService] Generating social content with messageId:', messageId);

    return this.generatePosts(context).pipe(
      switchMap(response => {
        console.log('📦 Generate Posts Response:', response);
        const posts = Object.values(response.networks);
        console.log('📦 Posts Array:', posts);

        const instagramPost = posts.find(p => p.platform.toLowerCase() === PLATFORMS.INSTAGRAM);
        const tiktokPost = posts.find(p => p.platform.toLowerCase() === PLATFORMS.TIKTOK);

        console.log('📸 Instagram Post:', instagramPost);
        console.log('🎬 TikTok Post:', tiktokPost);

        // 1. Set initial loading states
        if (instagramPost?.suggested_image_prompt) {
          console.log('📸 Starting Instagram image generation with prompt:', instagramPost.suggested_image_prompt);
          instagramPost.isLoadingImage = true;
        }
        if (tiktokPost?.suggested_video_prompt) {
          console.log('🎬 Starting TikTok video generation with prompt:', tiktokPost.suggested_video_prompt);
          tiktokPost.isLoadingVideo = true;
        }

        // If no media generation needed, return immediately
        if (!instagramPost?.suggested_image_prompt && !tiktokPost?.suggested_video_prompt) {
          console.log('✅ No media generation needed, returning posts as-is');
          return of(posts);
        }

        // 2. Create observables for media generation updates
        type UpdateEvent = { type: 'IMAGE' | 'VIDEO'; data: { url?: string; error?: boolean } };
        const updates: Observable<UpdateEvent>[] = [];

        // Image Generation Update
        if (instagramPost?.suggested_image_prompt) {
          const imageUpdate = this.generateImage(instagramPost.suggested_image_prompt, '', messageId).pipe(
            map(imageResponse => ({
              type: 'IMAGE' as const,
              data: { url: imageResponse.url }
            })),
            catchError(error => {
              console.error('❌ Error generating image:', error);
              return of({
                type: 'IMAGE' as const,
                data: { error: true }
              });
            })
          );
          updates.push(imageUpdate);
        }

        // Video Generation Update
        if (tiktokPost?.suggested_video_prompt) {
          const videoUpdate = this.generateVideo(tiktokPost.suggested_video_prompt, messageId).pipe(
            map(videoUrl => ({
              type: 'VIDEO' as const,
              data: { url: videoUrl }
            })),
            catchError(error => {
              console.error('❌ Error generating video:', error);
              return of({
                type: 'VIDEO' as const,
                data: { error: true }
              });
            })
          );
          updates.push(videoUpdate);
        }

        // 3. Emit initial posts, then progressively apply updates using scan
        return concat(
          of(posts),
          merge(...updates).pipe(
            // Use scan to accumulate updates on top of the current state
            map((updateEvent): ((currentPosts: NetworkPost[]) => NetworkPost[]) => {
              return (currentPosts: NetworkPost[]) => {
                return currentPosts.map(post => {
                  if (updateEvent.type === 'IMAGE' && post.platform.toLowerCase() === PLATFORMS.INSTAGRAM) {
                    console.log('📸 Applying Instagram image update');
                    return {
                      ...post,
                      imageUrl: updateEvent.data.url,
                      isLoadingImage: false
                    };
                  }
                  if (updateEvent.type === 'VIDEO' && post.platform.toLowerCase() === PLATFORMS.TIKTOK) {
                    console.log('🎬 Applying TikTok video update');
                    return {
                      ...post,
                      videoUrl: updateEvent.data.url,
                      isLoadingVideo: false
                    };
                  }
                  return post;
                });
              };
            }),
            // Scan to accumulate updates
            scan((currentPosts: NetworkPost[], updateFn: (posts: NetworkPost[]) => NetworkPost[]) => updateFn(currentPosts), posts)
          )
        );
      })
    );
  }
}
