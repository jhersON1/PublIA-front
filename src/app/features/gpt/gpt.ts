import { Component, signal, effect } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import type { Message } from './interfaces/message.interface';
import { GptService, type ChatResponse } from './services/gpt.service';
import type { NetworkPost } from './interfaces/network-post.interface';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-gpt',
  imports: [ Sidebar, ChatContainer, ChatInput],
  templateUrl: './gpt.html',
  styleUrl: './gpt.css',
})
export class Gpt {
  // Public signals
  messages = signal<Message[]>([]);
  socialPosts = signal<NetworkPost[]>([]);
  showAIResponse = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  // Private properties
  private lastResponseId: string = '';

  // Constructor
  constructor(
    private gptService: GptService,
    private sidebarService: SidebarService
  ) {
    // Effect para reaccionar a los cambios en el trigger de nuevo chat
    effect(() => {
      const trigger = this.sidebarService.getNewChatTrigger()();
      if (trigger > 0) {
        this.newChat();
      }
    });
  }

  // Public methods
  
  /**
   * Copia el contenido proporcionado al portapapeles del sistema.
   * @param content - Texto a copiar al portapapeles
   */
  handleCopyToClipboard(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Copied to clipboard:', content);
      // Aquí puedes agregar una notificación toast
    });
  }

  /**
   * Actualiza el texto de una publicación específica identificada por su plataforma.
   * @param update - Objeto con la plataforma y el nuevo texto del post
   */
  handleUpdatePost(update: { platform: string; text: string }): void {
    this.socialPosts.update(posts => 
      posts.map(post => 
        post.platform === update.platform 
          ? { ...post, text: update.text }
          : post
      )
    );
  }

  /**
   * Regenera la última respuesta de la IA reenviando el último mensaje del usuario.
   * Valida que exista un mensaje de usuario previo y que la última respuesta sea de la IA.
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
   * Envía un mensaje del usuario al servicio de GPT y maneja la respuesta.
   * @param message - Mensaje del usuario a enviar
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
   * Reinicia el chat limpiando todos los mensajes, publicaciones y el estado.
   */
  newChat(): void {
    this.messages.set([]);
    this.socialPosts.set([]);
    this.lastResponseId = '';
    this.showAIResponse.set(false);
  }

  /**
   * Maneja la acción de adjuntar archivos (placeholder para futura implementación).
   */
  handleAttachFile(): void {
    console.log('Attach file clicked');
    // Aquí puedes agregar lógica para abrir un file picker
  }

  /**
   * Maneja la entrada de voz (placeholder para futura implementación).
   */
  handleVoiceInput(): void {
    console.log('Voice input clicked');
    // Aquí puedes agregar lógica para capturar input de voz
  }

  // Private methods
  
  /**
   * Añade un nuevo mensaje al historial de conversación.
   * @param sender - Emisor del mensaje ('user' o 'ai')
   * @param content - Contenido del mensaje
   * @param responseId - ID de respuesta opcional para seguimiento del hilo de conversación
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
   * Solicita al servicio la generación de publicaciones para redes sociales basadas en el contexto.
   * @param context - Contexto extraído de la conversación para generar publicaciones
   */
  private generateSocialPostsFromContext(context: string): void {
    this.gptService.generatePosts(context).subscribe({
      next: (response) => {
        console.log('Response:', response);
        const posts: NetworkPost[] = Object.values(response.networks);

        this.socialPosts.set(posts);

        console.log('Generated social posts:', this.socialPosts());
        
        // Buscar el post de Instagram y generar la imagen
        const instagramPost = posts.find(post => post.platform.toLowerCase() === 'instagram');
        if (instagramPost?.suggested_image_prompt) {
          this.generateInstagramImage(instagramPost.suggested_image_prompt);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error al generar publicaciones:', error);
        this.clearSocialPosts();
      }
    });
  }

  /**
   * Genera la imagen para Instagram basándose en el prompt sugerido.
   * @param prompt - Prompt sugerido para generar la imagen
   */
  private generateInstagramImage(prompt: string): void {
    // Marcar que Instagram está cargando la imagen
    this.socialPosts.update(posts =>
      posts.map(post =>
        post.platform.toLowerCase() === 'instagram'
          ? { ...post, isLoadingImage: true }
          : post
      )
    );

    // Llamar al servicio para generar la imagen
    this.gptService.generateImage(prompt, '').subscribe({
      next: (response) => {
        console.log('Image generated:', response);
        
        // Actualizar el post de Instagram con la URL de la imagen
        this.socialPosts.update(posts =>
          posts.map(post =>
            post.platform.toLowerCase() === 'instagram'
              ? { ...post, imageUrl: response.url, isLoadingImage: false }
              : post
          )
        );
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al generar imagen de Instagram:', error);
        
        // Marcar el error en el post de Instagram
        this.socialPosts.update(posts =>
          posts.map(post =>
            post.platform.toLowerCase() === 'instagram'
              ? { ...post, isLoadingImage: false }
              : post
          )
        );
        
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Procesa la respuesta exitosa del chat, actualiza el estado y genera publicaciones si hay contexto.
   * @param response - Respuesta del servicio de chat con mensaje, ID y contexto opcional
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
   * Maneja errores en la comunicación con el servicio de chat mostrando un mensaje al usuario.
   * @param error - Error capturado durante la petición
   */
  private handleChatError(error: unknown): void {
    console.error('Error al enviar mensaje:', error);
    this.addMessage('ai', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.');
    this.isLoading.set(false);
  }

  /**
   * Verifica si el contexto recibido contiene información válida.
   * @param context - Contexto opcional a validar
   * @returns true si el contexto existe y no está vacío
   */
  private hasContext(context?: string | null): boolean {
    return Boolean(context?.trim());
  }

  /**
   * Limpia el array de publicaciones sociales y desactiva el estado de carga.
   */
  private clearSocialPosts(): void {
    this.socialPosts.set([]);
    this.isLoading.set(false);
  }

  /**
   * Obtiene el último mensaje del historial.
   * @returns El último mensaje o undefined si no hay mensajes
   */
  private getLastMessage(): Message | undefined {
    const list = this.messages();
    return list[list.length - 1];
  }

  /**
   * Busca el último mensaje emitido por un emisor específico.
   * @param sender - Tipo de emisor a buscar ('user' o 'ai')
   * @returns El último mensaje del emisor especificado o undefined
   */
  private getLastMessageBySender(sender: 'user' | 'ai'): Message | undefined {
    return [...this.messages()].reverse().find(message => message.sender === sender);
  }

  /**
   * Elimina el último mensaje del historial de conversación.
   */
  private removeLastMessage(): void {
    this.messages.update(msgs => msgs.slice(0, -1));
  }
}
