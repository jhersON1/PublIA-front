import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import type { Message } from './interfaces/message.interface';
import type { SocialPost } from './components/social-post-card/social-post-card';
import { GptService, type NetworkPost } from './services/gpt.service';

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
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdhvxftuCM4RaZTiXoLj1pqh7ALtTFyquVCfHf9iRbgjZ3E_GptnEWP_ZC8FfRfYf8ZG5Y57biMT6CvRqWTArTMmLUHKnbeYFjnKITdxEqFuSQw_SO0cMy48nbRHdhXLVGVi-cG3VSVBnJFtX36eBysrgnCsru_-PPEfKg7rTFMPb7-1bqCIWMqXOUK0L0HLNno1fwLfkPWTuSxbQ8SUtJOjkXQRkeNvFJTsgsvVkLbmNNpmpFp-4T40xcaLu9_FUXagcYR_mftybL',
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
        console.log('Response from GPT:', response);
        
        this.addMessage('ai', response.message, response.responseId);
        this.showAIResponse.set(true);
        
        // Actualizar el último responseId para el siguiente mensaje
        this.lastResponseId = response.responseId;
        
        // IMPORTANTE: Solo generar publicaciones si context NO está vacío
        if (response.context && response.context.trim() !== '') {
          this.generateSocialPostsFromContext(response.context);
        } else {
          // Limpiar las publicaciones si no hay context
          this.socialPosts.set([]);
          this.isLoading.set(false);
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

  private generateSocialPostsFromContext(context: string): void {
    const prompt = context.trim();
    if (!prompt) {
      this.socialPosts.set([]);
      this.isLoading.set(false);
      return;
    }

    this.gptService.generatePosts(prompt).subscribe({
      next: (response) => {
        const networks = response?.networks ?? {};
        const posts: SocialPost[] = Object.entries(networks)
          .map(([key, network]) => this.mapNetworkToSocialPost(key, network))
          .filter((post): post is SocialPost => Boolean(post));

        this.socialPosts.set(posts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al generar publicaciones:', error);
        this.socialPosts.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private mapNetworkToSocialPost(key: string, data?: NetworkPost): SocialPost | null {
    if (!data) {
      return null;
    }

    const platform = data.platform?.trim() || this.formatPlatformName(key);
    const hashtags = this.formatHashtags(data.hashtags);
    const content = this.composePostContent(data.text, hashtags);

    return {
      platform,
      content,
      icon: platform,
      color: ''
    };
  }

  private composePostContent(text: string | undefined, hashtags: string[]): string {
    const base = (text ?? '').trim();
    if (!hashtags.length) {
      return base;
    }

    const separator = base.length ? '\n\n' : '';
    return `${base}${separator}${hashtags.join(' ')}`.trim();
  }

  private formatHashtags(hashtags?: string[]): string[] {
    if (!Array.isArray(hashtags)) {
      return [];
    }

    return hashtags
      .map(tag => tag?.trim())
      .filter((tag): tag is string => Boolean(tag))
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  }

  private formatPlatformName(key: string): string {
    if (!key) {
      return 'Red Social';
    }

    return key.slice(0, 1).toUpperCase() + key.slice(1);
  }
}
