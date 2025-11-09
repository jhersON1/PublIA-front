import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatHistory = [
    { id: 1, title: 'Social Media Post', active: true },
    { id: 2, title: 'Creative Story Ideas', active: false },
    { id: 3, title: 'Python Script for Automation', active: false },
    { id: 4, title: 'Travel Itinerary: Japan', active: false },
  ];

  onNewChat() {
    console.log('New chat clicked');
  }

  onChatSelect(chatId: number) {
    this.chatHistory.forEach(chat => chat.active = chat.id === chatId);
  }
}
