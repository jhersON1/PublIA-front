import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import type { Message } from './interfaces/message.interface';
import type { SocialPost } from './components/social-post-card/social-post-card';
import { GptService } from './services/gpt.service';

@Component({
  selector: 'app-gpt',
  imports: [CommonModule, Sidebar, ChatContainer, ChatInput],
  templateUrl: './gpt.html',
  styleUrl: './gpt.css',
})
export class Gpt {
  messages = signal<Message[]>([]);
  socialPosts = signal<SocialPost[]>([]);
  showAIResponse = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  private lastResponseId: string = '';

  constructor(private gptService: GptService) {}

  private addMessage(sender: 'user' | 'ai', content: string, responseId?: string): void {
    const message: Message = {
      sender,
      content,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      avatar: sender === 'user' 
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG0-rnfDL9KvPqLiOm5wriU1wDs1rmvwlPjtvf4h9Dx_3srAOllLv3fxvMDEL1DcffIzxpydAJUqsodMGARd9c0Ppjv0XOnmYRwXE4OoGB2yzmU_UZeaDkOyW_GGNtcFrZqjhpfGRS8xV_RoEThdZbxcQweVdVTpvlHJrYzo9PySnnMF8yhPdjY7tba9ve71YO9R69AEoY7WhzoGd1gcAh4JFHa330oSxlYFlloyPnrJD3AHeW5UtB_fvjc3F6ZzNJqfdpk99IDzKu'
        : '',
      responseId
    };
    
    this.messages.update(msgs => [...msgs, message]);
  }

  // Handlers for chat container events
  handleCopyToClipboard(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Copied to clipboard:', content);
      // Aquí puedes agregar una notificación toast
    });
  }

  handleRegenerateResponse(): void {
    console.log('Regenerating response');
    // Regenerar la última respuesta usando el mismo prompt
    if (this.messages().length >= 2) {
      const lastUserMessage = [...this.messages()].reverse().find(m => m.sender === 'user');
      if (lastUserMessage) {
        // Remover la última respuesta de la IA
        this.messages.update(msgs => msgs.filter((_, index) => 
          index < msgs.length - 1
        ));
        // Reenviar el mensaje
        this.handleSendMessage(lastUserMessage.content);
      }
    }
  }

  // Handlers for chat input events
  handleSendMessage(message: string): void {
    if (!message.trim()) return;
    
    this.addMessage('user', message);
    this.isLoading.set(true);
    
    // Llamar al servicio con el último responseId (vacío si es nuevo chat)
    this.gptService.sendMessage(message, this.lastResponseId).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        this.addMessage('ai', response.message, response.responseId);
        this.showAIResponse.set(true);
        
        // Actualizar el último responseId para el siguiente mensaje
        this.lastResponseId = response.responseId;
        
        // IMPORTANTE: Solo generar publicaciones si context NO está vacío
        if (response.context && response.context.trim() !== '') {
          console.log('Context recibido:', response.context);
          console.log('Aquí se generarán las publicaciones sociales');
          // TODO: Implementar generación de publicaciones cuando sepamos la estructura del context
        } else {
          // Limpiar las publicaciones si no hay context
          this.socialPosts.set([]);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error al enviar mensaje:', error);
        
        this.addMessage('ai', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.');
      }
    });
  }

  // Método para crear un nuevo chat (resetear el hilo)
  newChat(): void {
    this.messages.set([]);
    this.socialPosts.set([]);
    this.lastResponseId = ''; // Resetear el responseId
    this.showAIResponse.set(false);
  }

  handleAttachFile(): void {
    console.log('Attach file clicked');
    // Aquí puedes agregar lógica para abrir un file picker
  }

  handleVoiceInput(): void {
    console.log('Voice input clicked');
    // Aquí puedes agregar lógica para capturar input de voz
  }
}

