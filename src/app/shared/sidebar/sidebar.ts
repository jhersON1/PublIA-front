import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatHistory = [
    { id: 1, title: 'Social Media Post', active: true },
  ];

  constructor(private sidebarService: SidebarService) {}

  onNewChat() {
    this.sidebarService.triggerNewChat();
  }

  onChatSelect(chatId: number) {
    this.chatHistory.forEach(chat => chat.active = chat.id === chatId);
  }
}
