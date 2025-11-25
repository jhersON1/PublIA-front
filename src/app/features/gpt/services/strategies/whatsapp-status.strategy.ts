import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WhatsAppPublishStrategy } from './whatsapp-publish.strategy';
import { WhatsAppResponse } from '../../interfaces';
import { NETWORK_ENDPOINTS } from '../../constants/networks';

/**
 * Strategy para subir texto al estado de WhatsApp
 */
@Injectable({
    providedIn: 'root'
})
export class WhatsAppStatusStrategy implements WhatsAppPublishStrategy {

    constructor(private http: HttpClient) { }

    publish(text: string): Observable<WhatsAppResponse> {
        return this.http.post<WhatsAppResponse>(
            NETWORK_ENDPOINTS.WHATSAPP.POST_STATUS,
            { text }
        );
    }
}
