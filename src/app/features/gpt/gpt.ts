import { Component, signal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import { SocialPublishingService } from './services/facades/social-publishing.service';
import { ChatStateService } from './services/facades/chat-state.service';

@Component({
  selector: 'app-gpt',
  imports: [Sidebar, ChatContainer, ChatInput],
  templateUrl: './gpt.html',
  styleUrl: './gpt.css',
})
export class Gpt {
  isSidebarOpen = signal<boolean>(false);

  constructor(
    public chatStateService: ChatStateService,
    private socialPublishingService: SocialPublishingService
  ) { }

  /**
   * Maneja la publicación de todas las publicaciones sociales.
   */
  handlePublishAll(): void {
    this.socialPublishingService.publishAll(this.chatStateService.socialPosts());
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

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
