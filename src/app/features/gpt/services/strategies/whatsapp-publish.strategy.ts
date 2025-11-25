import { Observable } from 'rxjs';
import { WhatsAppResponse } from '../../interfaces';

/**
 * Strategy interface para publicar en WhatsApp
 */
export interface WhatsAppPublishStrategy {
    publish(text: string): Observable<WhatsAppResponse>;
}
