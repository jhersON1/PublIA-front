import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../features/gpt/services/chat.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatService = inject(ChatService);

  editingChatId: string | null = null;

  onNewChat() {
    console.log('🔵 [Sidebar] New Chat button clicked - setting currentChatId to null');
    this.chatService.selectChat(null as any);
    // Clear the UI state through SidebarService
    // The actual chat will be created when the user sends the first message
  }

  onChatSelect(chatId: string) {
    if (this.editingChatId === chatId) return;
    console.log('🔵 [Sidebar] Chat selected:', chatId);
    this.chatService.selectChat(chatId);
  }

  onDeleteChat(chatId: string, event: Event) {
    event.stopPropagation();
    console.log('🔵 [Sidebar] Delete chat clicked:', chatId);

    if (confirm('¿Estás seguro de que quieres eliminar este chat?')) {
      this.chatService.deleteChat(chatId).subscribe({
        next: (success) => {
          if (success) {
            console.log('✅ [Sidebar] Chat deleted successfully');
          }
        },
        error: (error) => {
          console.error('❌ [Sidebar] Error deleting chat:', error);
        }
      });
    }
  }

  onRenameChat(chatId: string, event: Event) {
    event.stopPropagation();
    console.log('🔵 [Sidebar] Rename chat clicked:', chatId);
    this.startEditing(chatId, event);
  }

  startEditing(chatId: string, event: Event) {
    event.stopPropagation();
    this.editingChatId = chatId;
  }

  saveEdit(chatId: string, newTitle: string) {
    if (this.editingChatId !== chatId) return;

    // If title hasn't changed or is empty, just cancel
    const currentChat = this.chatService.chats().find(c => c._id === chatId);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === currentChat?.title) {
      this.cancelEditing();
      return;
    }

    this.chatService.renameChat(chatId, newTitle.trim()).subscribe({
      next: (success) => {
        if (success) {
          console.log('✅ [Sidebar] Chat renamed successfully');
          this.editingChatId = null;
        }
      },
      error: (error) => {
        console.error('❌ [Sidebar] Error renaming chat:', error);
        this.editingChatId = null;
      }
    });
  }

  cancelEditing() {
    this.editingChatId = null;
  }
}
