import { Component, inject } from '@angular/core';
import { ChatService } from '../../features/gpt/services/chat.service';
import { ChatListComponent } from './chat-list/chat-list.component';
import { AuthService } from '../../auth/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [ChatListComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatService = inject(ChatService);
  authService = inject(AuthService);

  onNewChat() {
    this.chatService.selectChat(null as any);
    // Clear the UI state through SidebarService
    // The actual chat will be created when the user sends the first message
  }

  onLogout() {
    this.authService.logout();
  }
}
