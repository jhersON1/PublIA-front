import { Component, signal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import { SocialPublishingService } from './services/facades/social-publishing.service';
import { ChatStateService } from './services/facades/chat-state.service';
import { SocialStateService } from './services/facades/social-state.service';

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
    public socialStateService: SocialStateService,
    private socialPublishingService: SocialPublishingService
  ) { }

  /**
   * Maneja la publicación de todas las publicaciones sociales.
   */
  handlePublishAll(): void {
    this.socialPublishingService.publishAll(this.socialStateService.socialPosts());
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
