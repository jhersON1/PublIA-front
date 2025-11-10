import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import type { Message } from './components/chat-message/chat-message';
import type { SocialPost } from './components/social-post-card/social-post-card';
import { GptService } from './services/gpt.service';

@Component({
  selector: 'app-gpt',
  imports: [CommonModule, Sidebar, ChatContainer, ChatInput],
  templateUrl: './gpt.html',
  styleUrl: './gpt.css',
})
export class Gpt {
  messages: Message[] = [];
  socialPosts: SocialPost[] = [];
  showAIResponse: boolean = false;
  isLoading: boolean = false;
  
  // Variable crítica: guarda el último responseId para mantener el hilo
  private lastResponseId: string = '';

  constructor(private gptService: GptService) {}

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
    if (this.messages.length >= 2) {
      const lastUserMessage = [...this.messages].reverse().find(m => m.sender === 'user');
      if (lastUserMessage) {
        // Remover la última respuesta de la IA
        this.messages = this.messages.filter((_, index) => 
          index < this.messages.length - 1
        );
        // Reenviar el mensaje
        this.handleSendMessage(lastUserMessage.content);
      }
    }
  }

  // Handlers for chat input events
  handleSendMessage(message: string): void {
    if (!message.trim()) return;
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      sender: 'user',
      content: message,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG0-rnfDL9KvPqLiOm5wriU1wDs1rmvwlPjtvf4h9Dx_3srAOllLv3fxvMDEL1DcffIzxpydAJUqsodMGARd9c0Ppjv0XOnmYRwXE4OoGB2yzmU_UZeaDkOyW_GGNtcFrZqjhpfGRS8xV_RoEThdZbxcQweVdVTpvlHJrYzo9PySnnMF8yhPdjY7tba9ve71YO9R69AEoY7WhzoGd1gcAh4JFHa330oSxlYFlloyPnrJD3AHeW5UtB_fvjc3F6ZzNJqfdpk99IDzKu'
    };
    
    this.messages.push(userMessage);
    this.isLoading = true;
    
    // Llamar al servicio con el último responseId (vacío si es nuevo chat)
    this.gptService.sendMessage(message, this.lastResponseId).subscribe({
      next: (response) => {
        console.log('Respuesta de la IA recibida:', response);
        this.isLoading = false;
        
        // Agregar respuesta de la IA
        const aiMessage: Message = {
          sender: 'ai',
          content: response.message,
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          avatar: '', // Puedes agregar un avatar para la IA
          responseId: response.responseId
        };
        
        this.messages.push(aiMessage);
        this.showAIResponse = true;
        
        // Actualizar el último responseId para el siguiente mensaje
        this.lastResponseId = response.responseId;
        
        // IMPORTANTE: Solo generar publicaciones si context NO está vacío
        if (response.context && response.context.trim() !== '') {
          console.log('Context recibido:', response.context);
          console.log('Aquí se generarán las publicaciones sociales');
          // TODO: Implementar generación de publicaciones cuando sepamos la estructura del context
        } else {
          // Limpiar las publicaciones si no hay context
          this.socialPosts = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al enviar mensaje:', error);
        
        // Mostrar mensaje de error al usuario
        const errorMessage: Message = {
          sender: 'ai',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          avatar: ''
        };
        
        this.messages.push(errorMessage);
      }
    });
  }

  // Método para crear un nuevo chat (resetear el hilo)
  newChat(): void {
    this.messages = [];
    this.socialPosts = [];
    this.lastResponseId = ''; // Resetear el responseId
    this.showAIResponse = false;
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

