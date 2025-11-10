import { Component, signal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import type { Message } from './interfaces/message.interface';
import { GptService, type ChatResponse } from './services/gpt.service';
import type { NetworkPost } from './interfaces/network-post.interface';

@Component({
  selector: 'app-gpt',
  imports: [ Sidebar, ChatContainer, ChatInput],
  templateUrl: './gpt.html',
  styleUrl: './gpt.css',
})
export class Gpt {
  messages = signal<Message[]>([]);
  socialPosts = signal<NetworkPost[]>([]);
  showAIResponse = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  private lastResponseId: string = '';

  constructor(private gptService: GptService) {}

  /**
   * Registra un mensaje nuevo en el historial manteniendo la metadata básica.
   */
  private addMessage(sender: 'user' | 'ai', content: string, responseId?: string): void {
    const message: Message = {
      sender,
      content,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      avatar: sender === 'user' 
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG0-rnfDL9KvPqLiOm5wriU1wDs1rmvwlPjtvf4h9Dx_3srAOllLv3fxvMDEL1DcffIzxpydAJUqsodMGARd9c0Ppjv0XOnmYRwXE4OoGB2yzmU_UZeaDkOyW_GGNtcFrZqjhpfGRS8xV_RoEThdZbxcQweVdVTpvlHJrYzo9PySnnMF8yhPdjY7tba9ve71YO9R69AEoY7WhzoGd1gcAh4JFHa330oSxlYFlloyPnrJD3AHeW5UtB_fvjc3F6ZzNJqfdpk99IDzKu'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdhvxftuCM4RaZTiXoLj1pqh7ALtTFyquVCfHf9iRbgjZ3E_GptnEWP_ZC8FfRfYf8ZG5Y57biMT6CvRqWTArTMmLUHKnbeYFjnKITdxEqFuSQw_SO0cMy48nbRHdhXLVGVi-cG3VSVBnJFtX36eBysrgnCsru_-PPEfKg7rTFMPb7-1bqCIWMqXOUK0L0HLNno1fwLfkPWTuSxbQ8SUtJOjkXQRkeNvFJTsgsvVkLbmNNpmpFp-4T40xcaLu9_FUXagcYR_mftybL',
      responseId
    };
    
    this.messages.update(msgs => [...msgs, message]);
  }

  /**
   * Copia al portapapeles el contenido solicitado desde el contenedor de chat.
   */
  handleCopyToClipboard(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Copied to clipboard:', content);
      // Aquí puedes agregar una notificación toast
    });
  }

  /**
   * Reenvía el último mensaje del usuario para regenerar la respuesta de la IA.
   */
  handleRegenerateResponse(): void {
    if (this.messages().length < 2) {
      return;
    }

    const lastUserMessage = this.getLastMessageBySender('user');
    const lastMessage = this.getLastMessage();

    if (!lastUserMessage || lastMessage?.sender !== 'ai') {
      return;
    }

    this.removeLastMessage();
    this.handleSendMessage(lastUserMessage.content);
  }

  /**
   * Envía el mensaje del usuario al backend aplicando trim y controlando el loading.
   */
  handleSendMessage(message: string): void {
    const prompt = message.trim();
    if (!prompt) {
      return;
    }
    
    this.addMessage('user', prompt);
    this.isLoading.set(true);
    
    this.gptService.sendMessage(prompt, this.lastResponseId).subscribe({
      next: (response) => this.handleChatSuccess(response),
      error: (error) => this.handleChatError(error),
    });
  }

  /**
   * Limpia el estado del hilo para iniciar una nueva conversación.
   */
  newChat(): void {
    this.messages.set([]);
    this.socialPosts.set([]);
    this.lastResponseId = ''; // Resetear el responseId
    this.showAIResponse.set(false);
  }

  /**
   * Placeholder para el flujo de adjuntar archivos desde el input.
   */
  handleAttachFile(): void {
    console.log('Attach file clicked');
    // Aquí puedes agregar lógica para abrir un file picker
  }

  /**
   * Placeholder para iniciar la captura de entrada por voz.
   */
  handleVoiceInput(): void {
    console.log('Voice input clicked');
    // Aquí puedes agregar lógica para capturar input de voz
  }

  /**
   * Solicita al backend las publicaciones sociales usando el context retornado por /chat.
   */
  private generateSocialPostsFromContext(context: string): void {
    const prompt = context.trim();
    if (!prompt) {
      this.clearSocialPosts();
      return;
    }

    this.gptService.generatePosts(prompt).subscribe({
      next: (response) => {
        console.log('Response:', response);
        const networks = response?.networks ?? {};
        const posts: NetworkPost[] = Object.values(networks);

        this.socialPosts.set(posts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al generar publicaciones:', error);
        this.clearSocialPosts();
      }
    });
  }

  /**
   * Maneja la respuesta exitosa del endpoint /chat actualizando estado y context.
   */
  private handleChatSuccess(response: ChatResponse): void {
    this.addMessage('ai', response.message, response.responseId);
    this.showAIResponse.set(true);
    this.lastResponseId = response.responseId;

    if (this.hasContext(response.context)) {
      this.generateSocialPostsFromContext(response.context);
      return;
    }

    this.clearSocialPosts();
  }

  /**
   * Presenta un mensaje de error en el chat cuando /chat falla.
   */
  private handleChatError(error: unknown): void {
    console.error('Error al enviar mensaje:', error);
    this.addMessage('ai', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.');
    this.isLoading.set(false);
  }

  /**
   * Verifica si el context recibido contiene información aprovechable.
   */
  private hasContext(context?: string | null): boolean {
    return Boolean(context?.trim());
  }

  /**
   * Limpia las publicaciones sociales y apaga el estado de carga.
   */
  private clearSocialPosts(): void {
    this.socialPosts.set([]);
    this.isLoading.set(false);
  }

  /**
   * Obtiene el último mensaje (sin mutar la señal) para flujos como Regenerate.
   */
  private getLastMessage(): Message | undefined {
    const list = this.messages();
    return list[list.length - 1];
  }

  /**
   * Busca el último mensaje emitido por un emisor específico.
   */
  private getLastMessageBySender(sender: 'user' | 'ai'): Message | undefined {
    return [...this.messages()].reverse().find(message => message.sender === sender);
  }

  /**
   * Elimina el mensaje más reciente del historial.
   */
  private removeLastMessage(): void {
    this.messages.update(msgs => msgs.slice(0, -1));
  }
}
