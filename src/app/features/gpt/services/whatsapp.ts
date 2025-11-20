import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NETWORK_ENDPOINTS } from '../constants/networks';
import { SocialPostResponse, WhatsAppPostRequest } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private http = inject(HttpClient);

  publishWhatsApp(body: WhatsAppPostRequest): Observable<SocialPostResponse> {
    return this.http.post<SocialPostResponse>(NETWORK_ENDPOINTS.WHATSAPP.SEND_TEMPLATE, body);
  }
}
