import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concat, map, Observable, of, switchMap, catchError } from 'rxjs';
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
}

export interface GeneratePostsRequest {
  prompt: string;
}

export interface GeneratePostsResponse {
  networks: Record<string, NetworkPost>;
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

  private http: HttpClient = inject(HttpClient);

  sendMessage(prompt: string, previousResponseId: string = ''): Observable<ChatResponse> {
    const body: ChatRequest = {
      prompt,
      previousResponseId
    };

    return this.http.post<ChatResponse>(this.CHAT_URL, body);
  }

  generatePosts(prompt: string): Observable<GeneratePostsResponse> {
    const body: GeneratePostsRequest = { prompt };
    return this.http.post<GeneratePostsResponse>(this.GENERATE_POSTS_URL, body);
  }

  generateImage(prompt: string, previousResponseId: string = ''): Observable<GenerateImageResponse> {
    const body: GenerateImageRequest = {
      prompt,
      previousResponseId
    };
    return this.http.post<GenerateImageResponse>(this.GENERATE_IMAGE_URL, body);
  }

  /**
   * Genera publicaciones para redes sociales y, si es necesario, la imagen para Instagram.
   * Emite primero las publicaciones y luego una actualización con la imagen generada.
   * @param context - Contexto para generar los posts
   */
  generateSocialContent(context: string): Observable<NetworkPost[]> {
    return this.generatePosts(context).pipe(
      switchMap(response => {
        const posts = Object.values(response.networks);
        const instagramPost = posts.find(p => p.platform.toLowerCase() === PLATFORMS.INSTAGRAM);

        // if (instagramPost?.suggested_image_prompt) {
        //   // Marcar que se está cargando la imagen
        //   const postsWithLoading = posts.map(p =>
        //     p.platform.toLowerCase() === PLATFORMS.INSTAGRAM
        //       ? { ...p, isLoadingImage: true }
        //       : p
        //   );

        //   return concat(
        //     of(postsWithLoading), // Emitir posts con estado de carga
        //     this.generateImage(instagramPost.suggested_image_prompt).pipe(
        //       map(imageResponse => {
        //         // Actualizar post con la imagen
        //         return posts.map(p =>
        //           p.platform.toLowerCase() === PLATFORMS.INSTAGRAM
        //             ? { ...p, imageUrl: imageResponse.url, isLoadingImage: false }
        //             : p
        //         );
        //       }),
        //       catchError(error => {
        //         console.error('Error generating image:', error);
        //         // En caso de error, devolvemos los posts originales pero sin loading
        //         const postsWithError = posts.map(p =>
        //           p.platform.toLowerCase() === PLATFORMS.INSTAGRAM
        //             ? { ...p, isLoadingImage: false }
        //             : p
        //         );
        //         return of(postsWithError);
        //       })
        //     )
        //   );
        // }

        return of(posts);
      })
    );
  }
}
