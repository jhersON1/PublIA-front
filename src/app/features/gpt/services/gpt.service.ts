import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NetworkPost } from '../interfaces/network-post.interface';

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
}
