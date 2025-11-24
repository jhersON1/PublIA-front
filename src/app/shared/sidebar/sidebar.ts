import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../features/gpt/services/chat.service';
import { ChatListComponent } from './chat-list/chat-list.component';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, ChatListComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatService = inject(ChatService);

  onNewChat() {
    console.log('🔵 [Sidebar] New Chat button clicked - setting currentChatId to null');
    this.chatService.selectChat(null as any);
    // Clear the UI state through SidebarService
    // The actual chat will be created when the user sends the first message
  }
}
