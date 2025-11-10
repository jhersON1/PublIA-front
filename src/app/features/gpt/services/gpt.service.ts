import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatRequest {
  prompt: string;
  previousResponseId: string;
}

export interface ChatResponse {
  message: string;
  context: string;
  responseId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GptService {
  private readonly API_URL = 'http://localhost:3000/gpt/chat';

  private http: HttpClient = inject(HttpClient);

  sendMessage(prompt: string, previousResponseId: string = ''): Observable<ChatResponse> {
    const body: ChatRequest = {
      prompt,
      previousResponseId
    };

    return this.http.post<ChatResponse>(this.API_URL, body);
  }
}
