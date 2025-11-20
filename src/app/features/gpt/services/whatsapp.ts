import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NETWORK_ENDPOINTS } from '../constants/networks';
import { WhatsAppPostRequest, WhatsAppResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private http = inject(HttpClient);

  publishWhatsApp(body: WhatsAppPostRequest): Observable<WhatsAppResponse> {
    return this.http.post<WhatsAppResponse>(NETWORK_ENDPOINTS.WHATSAPP.SEND_TEMPLATE, body);
  }
}
