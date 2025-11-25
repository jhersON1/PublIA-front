import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concat, map, Observable, of, switchMap, catchError, merge, tap, scan } from 'rxjs';
import { NetworkPost } from '../interfaces/network-post.interface';
import { PLATFORMS, GPT_API_URLS } from '../constants/gpt.constants';

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
  chatId?: string;
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

type UpdateEvent = { type: 'IMAGE' | 'VIDEO'; data: { url?: string; error?: boolean } };

@Injectable({
  providedIn: 'root'
})
export class GptService {
  private http: HttpClient = inject(HttpClient);

  // ==================== PUBLIC METHODS ====================

  sendMessage(prompt: string, previousResponseId: string = '', chatId?: string): Observable<ChatResponse> {
    const body: any = {
      prompt,
      previousResponseId
    };

    if (chatId) {
      body.chatId = chatId;
    }

    return this.http.post<ChatResponse>(GPT_API_URLS.CHAT, body);
  }

  generatePosts(prompt: string, chatId?: string): Observable<GeneratePostsResponse> {
    const body: GeneratePostsRequest = { prompt };
    if (chatId) {
      body.chatId = chatId;
    }
    return this.http.post<GeneratePostsResponse>(GPT_API_URLS.GENERATE_POSTS, body);
  }

  generateImage(prompt: string, previousResponseId: string = '', messageId?: string): Observable<GenerateImageResponse> {
    const body: any = {
      prompt,
      previousResponseId
    };

    if (messageId) {
      body.messageId = messageId;
    }

    return this.http.post<GenerateImageResponse>(GPT_API_URLS.GENERATE_IMAGE, body);
  }

  startVideoGeneration(prompt: string, messageId?: string): Observable<{ operationId: string }> {
    const body: any = { prompt };

    if (messageId) {
      body.messageId = messageId;
    }

    return this.http.post<{ operationId: string }>(GPT_API_URLS.VIDEO_GENERATE, body);
  }

  checkVideoStatus(operationId: string): Observable<{ status: string; url?: string }> {
    return this.http.get<{ status: string; url?: string }>(`${GPT_API_URLS.VIDEO_STATUS}?id=${operationId}`);
  }

  generateVideo(prompt: string, messageId?: string): Observable<string> {
    return this.startVideoGeneration(prompt, messageId).pipe(
      switchMap(response => this.pollVideoStatus(response.operationId))
    );
  }

  /**
   * Genera publicaciones para redes sociales y, si es necesario, la imagen para Instagram y video para TikTok.
   * Emite actualizaciones progresivas a medida que se completa la generación de medios.
   * @param context - Contexto para generar los posts
   * @param messageId - Optional message ID to associate media with
   * @param chatId - Optional chat ID to associate posts with
   */
  generateSocialContent(context: string, messageId?: string, chatId?: string): Observable<NetworkPost[]> {
    return this.generatePosts(context, chatId).pipe(
      switchMap(response => {
        const posts = Object.values(response.networks);
        const instagramPost = posts.find(p => p.platform.toLowerCase() === PLATFORMS.INSTAGRAM);
        const tiktokPost = posts.find(p => p.platform.toLowerCase() === PLATFORMS.TIKTOK);

        this.setLoadingStates(instagramPost, tiktokPost);

        // If no media generation needed, return immediately
        if (!instagramPost?.suggested_image_prompt && !tiktokPost?.suggested_video_prompt) {
          return of(posts);
        }

        const updates = this.createMediaGenerationUpdates(instagramPost, tiktokPost);
        return this.emitProgressiveUpdates(posts, updates);
      })
    );
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Polls video status until completion, failure, or timeout
   */
  private pollVideoStatus(operationId: string): Observable<string> {
    const startTime = Date.now();
    const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
    const POLL_INTERVAL_MS = 15000; // 15 seconds

    return new Observable<string>(observer => {
      const pollInterval = setInterval(() => {
        if (this.isVideoGenerationTimedOut(startTime, TIMEOUT_MS)) {
          clearInterval(pollInterval);
          console.error('Video generation timeout after 2 minutes');
          observer.error('Video generation timeout');
          return;
        }

        this.checkVideoStatus(operationId).subscribe({
          next: (statusResponse) => {
            this.handleVideoStatusResponse(statusResponse, pollInterval, observer);
          },
          error: (err) => {
            clearInterval(pollInterval);
            console.error('Error checking video status:', err);
            observer.error(err);
          }
        });
      }, POLL_INTERVAL_MS);

      return () => clearInterval(pollInterval);
    });
  }

  /**
   * Checks if video generation has exceeded the timeout
   */
  private isVideoGenerationTimedOut(startTime: number, timeoutMs: number): boolean {
    return Date.now() - startTime > timeoutMs;
  }

  /**
   * Handles the video status response and manages observer state
   */
  private handleVideoStatusResponse(
    statusResponse: { status: string; url?: string },
    pollInterval: number,
    observer: any
  ): void {
    if (statusResponse.status === 'COMPLETED' && statusResponse.url) {
      clearInterval(pollInterval);
      observer.next(statusResponse.url);
      observer.complete();
    } else if (statusResponse.status === 'FAILED') {
      clearInterval(pollInterval);
      console.error('Video generation failed');
      observer.error('Video generation failed');
    }
    // If RUNNING, continue polling (do nothing)
  }

  /**
   * Sets loading states for Instagram and TikTok posts
   */
  private setLoadingStates(instagramPost?: NetworkPost, tiktokPost?: NetworkPost): void {
    if (instagramPost?.suggested_image_prompt) {
      instagramPost.isLoadingImage = true;
    }
    if (tiktokPost?.suggested_video_prompt) {
      tiktokPost.isLoadingVideo = true;
    }
  }

  /**
   * Creates observables for media generation updates
   */
  private createMediaGenerationUpdates(instagramPost?: NetworkPost, tiktokPost?: NetworkPost): Observable<UpdateEvent>[] {
    const updates: Observable<UpdateEvent>[] = [];

    if (instagramPost?.suggested_image_prompt) {
      updates.push(this.createImageGenerationUpdate(instagramPost.suggested_image_prompt));
    }

    if (tiktokPost?.suggested_video_prompt) {
      updates.push(this.createVideoGenerationUpdate(tiktokPost.suggested_video_prompt));
    }

    return updates;
  }

  /**
   * Creates an observable for image generation
   */
  private createImageGenerationUpdate(prompt: string): Observable<UpdateEvent> {
    return this.generateImage(prompt, '', undefined).pipe(
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
  }

  /**
   * Creates an observable for video generation
   */
  private createVideoGenerationUpdate(prompt: string): Observable<UpdateEvent> {
    return this.generateVideo(prompt, undefined).pipe(
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
  }

  /**
   * Emits initial posts and then progressive updates as media generation completes
   */
  private emitProgressiveUpdates(posts: NetworkPost[], updates: Observable<UpdateEvent>[]): Observable<NetworkPost[]> {
    return concat(
      of(posts),
      merge(...updates).pipe(
        map((updateEvent): ((currentPosts: NetworkPost[]) => NetworkPost[]) => {
          return (currentPosts: NetworkPost[]) => this.applyUpdateToPost(currentPosts, updateEvent);
        }),
        scan((currentPosts: NetworkPost[], updateFn: (posts: NetworkPost[]) => NetworkPost[]) => updateFn(currentPosts), posts)
      )
    );
  }

  /**
   * Applies an update event to the corresponding post
   */
  private applyUpdateToPost(posts: NetworkPost[], updateEvent: UpdateEvent): NetworkPost[] {
    return posts.map(post => {
      if (updateEvent.type === 'IMAGE' && post.platform.toLowerCase() === PLATFORMS.INSTAGRAM) {
        return {
          ...post,
          imageUrl: updateEvent.data.url,
          isLoadingImage: false
        };
      }
      if (updateEvent.type === 'VIDEO' && post.platform.toLowerCase() === PLATFORMS.TIKTOK) {
        return {
          ...post,
          videoUrl: updateEvent.data.url,
          isLoadingVideo: false
        };
      }
      return post;
    });
  }
}
