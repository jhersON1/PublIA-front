import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WhatsAppResponse } from '../interfaces';
import { WhatsAppPublishStrategy } from './strategies/whatsapp-publish.strategy';
import { WhatsAppNumberStrategy } from './strategies/whatsapp-number.strategy';
import { WhatsAppStatusStrategy } from './strategies/whatsapp-status.strategy';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private http = inject(HttpClient);
  private numberStrategy = new WhatsAppNumberStrategy(this.http);
  private statusStrategy = new WhatsAppStatusStrategy(this.http);

  /**
   * Publica en WhatsApp usando la estrategia especificada
   */
  publish(text: string, type: 'number' | 'status' = 'status'): Observable<WhatsAppResponse> {
    const strategy = this.getStrategy(type);
    return strategy.publish(text);
  }

  /**
   * Obtiene la estrategia según el tipo de publicación
   */
  private getStrategy(type: 'number' | 'status'): WhatsAppPublishStrategy {
    return type === 'number' ? this.numberStrategy : this.statusStrategy;
  }
}
