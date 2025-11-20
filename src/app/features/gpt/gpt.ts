import { Component, signal, effect } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import type { Message } from './interfaces/message.interface';
import { GptService, type ChatResponse } from './services/gpt.service';
import type { NetworkPost } from './interfaces/network-post.interface';
import { SidebarService } from '../../services/sidebar.service';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { AVATAR_URLS } from './constants/gpt.constants';

import { FacebookService } from './services/facebook';
import { LinkedInService } from './services/linkedin';
import { InstagramService } from './services/instagram';
import { CloudinaryService } from './services/cloudinary';
import { WhatsAppService } from './services/whatsapp';
import { Tiktok } from './services/tiktok';
import { PLATFORMS } from './constants/gpt.constants';

@Component({
  selector: 'app-gpt',
  imports: [Sidebar, ChatContainer, ChatInput],
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
    private sidebarService: SidebarService,
    private clipboardService: ClipboardService,
    private facebookService: FacebookService,
    private linkedInService: LinkedInService,
    private instagramService: InstagramService,
    private cloudinaryService: CloudinaryService,
    private whatsAppService: WhatsAppService,
    private tiktokService: Tiktok
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
    this.clipboardService.copyToClipboard(content);
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
   * Almacena el archivo de imagen seleccionado localmente en el post correspondiente.
   * @param update - Objeto con la plataforma y el archivo
   */
  handleUpdateImageFile(update: { platform: string; file: File }): void {
    this.socialPosts.update(posts =>
      posts.map(post =>
        post.platform === update.platform
          ? { ...post, localImageFile: update.file }
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

  /**
   * Maneja la publicación de todas las publicaciones sociales (placeholder para futura implementación).
   */
  /**
   * Maneja la publicación de todas las publicaciones sociales (placeholder para futura implementación).
   */
  handlePublishAll(): void {
    console.log('Publicar todas las publicaciones', this.socialPosts());

    const facebookPost = this.socialPosts().find(p => p.platform.toLowerCase() === PLATFORMS.FACEBOOK);
    if (facebookPost) {
      this.facebookService.publishFacebook({ text: facebookPost.text }).subscribe({
        next: (response) => {
          console.log('Facebook post published:', response);
          // Aquí podrías actualizar el estado del post o mostrar una notificación
        },
        error: (error) => {
          console.error('Error publishing to Facebook:', error);
        }
      });
    }

    const linkedInPost = this.socialPosts().find(p => p.platform.toLowerCase() === PLATFORMS.LINKEDIN);
    if (linkedInPost) {
      this.linkedInService.publishLinkedIn({
        text: linkedInPost.text,
        articleUrl: 'https://blog.linkedin.com/',
        articleTitle: 'Official LinkedIn Blog',
        articleDescription: 'Your source for insights and information about LinkedIn.'
      }).subscribe({
        next: (response) => {
          console.log('LinkedIn post published:', response);
        },
        error: (error) => {
          console.error('Error publishing to LinkedIn:', error);
        }
      });
    }

    // Instagram: upload to Cloudinary first, then publish
    const instagramPost = this.socialPosts().find(p => p.platform.toLowerCase() === PLATFORMS.INSTAGRAM);
    if (instagramPost) {
      // Check if there's a local image file to upload
      if (instagramPost.localImageFile) {
        // Upload to Cloudinary first
        this.cloudinaryService.uploadFile(instagramPost.localImageFile).subscribe({
          next: (cloudinaryResponse) => {
            // Use secure_url from Cloudinary response
            this.instagramService.publishInstagram({
              imageUrl: cloudinaryResponse.secure_url,
              caption: instagramPost.text
            }).subscribe({
              next: (response) => {
                console.log('Instagram post published:', response);
              },
              error: (error) => {
                console.error('Error publishing to Instagram:', error);
              }
            });
          },
          error: (error) => {
            console.error('Error uploading image to Cloudinary:', error);
          }
        });
      } else if (instagramPost.imageUrl) {
        // If there's a generated imageUrl, use it directly
        this.instagramService.publishInstagram({
          imageUrl: instagramPost.imageUrl,
          caption: instagramPost.text
        }).subscribe({
          next: (response) => {
            console.log('Instagram post published:', response);
          },
          error: (error) => {
            console.error('Error publishing to Instagram:', error);
          }
        });
      } else {
        console.warn('Instagram post has no image to publish');
      }
    }

    // WhatsApp: publish with static to and languageCode
    const whatsappPost = this.socialPosts().find(p => p.platform.toLowerCase() === PLATFORMS.WHATSAPP);
    if (whatsappPost) {
      this.whatsAppService.publishWhatsApp({
        to: '59172184204',
        templateName: whatsappPost.text,
        languageCode: 'en_US'
      }).subscribe({
        next: (response) => {
          console.log('WhatsApp message sent:', response);
        },
        error: (error) => {
          console.error('Error sending WhatsApp message:', error);
        }
      });
    }

    // TikTok: publish video
    const tiktokPost = this.socialPosts().find(p => p.platform.toLowerCase() === PLATFORMS.TIKTOK);
    if (tiktokPost) {
      if (tiktokPost.localImageFile) {
        this.tiktokService.publishVideo(tiktokPost.localImageFile).subscribe({
          next: (response) => {
            console.log('TikTok video published:', response);
            if (response.success) {
              console.log(response.message);
            }
          },
          error: (error) => {
            console.error('Error publishing to TikTok:', error);
          }
        });
      } else if (tiktokPost.videoUrl) {
        this.tiktokService.publishVideo(tiktokPost.videoUrl).subscribe({
          next: (response) => {
            console.log('TikTok video published:', response);
            if (response.success) {
              console.log(response.message);
            }
          },
          error: (error) => {
            console.error('Error publishing to TikTok:', error);
          }
        });
      } else {
        console.warn('TikTok post has no video file to publish');
      }
    }
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
      avatar: sender === 'user' ? AVATAR_URLS.USER : AVATAR_URLS.AI,
      responseId
    };

    this.messages.update(msgs => [...msgs, message]);
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
      this.generateSocialContent(response.context);
      return;
    }

    this.clearSocialPosts();
  }

  /**
   * Solicita al servicio la generación de contenido social (posts e imágenes).
   * @param context - Contexto extraído de la conversación
   */
  private generateSocialContent(context: string): void {
    this.gptService.generateSocialContent(context).subscribe({
      next: (posts) => {
        this.socialPosts.set(posts);

        // Si ya no hay posts cargando imagen, terminamos el loading
        const isLoadingImage = posts.some(p => p.isLoadingImage);
        if (!isLoadingImage) {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error al generar contenido social:', error);
        this.clearSocialPosts();
      }
    });
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
