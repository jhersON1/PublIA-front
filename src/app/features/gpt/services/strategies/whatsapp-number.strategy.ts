import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WhatsAppPublishStrategy } from './whatsapp-publish.strategy';
import { WhatsAppResponse } from '../../interfaces';
import { NETWORK_ENDPOINTS } from '../../constants/networks';

/**
 * Strategy para enviar mensaje a un número de WhatsApp
 */
@Injectable({
    providedIn: 'root'
})
export class WhatsAppNumberStrategy implements WhatsAppPublishStrategy {

    constructor(private http: HttpClient) { }

    publish(text: string): Observable<WhatsAppResponse> {
        const body = {
            messaging_product: "whatsapp",
            to: "59172184204", // Número hardcodeado
            type: "text",
            text: {
                preview_url: false,
                body: text
            }
        };

        return this.http.post<WhatsAppResponse>(NETWORK_ENDPOINTS.WHATSAPP.SEND_TEXT, body);
    }
}
