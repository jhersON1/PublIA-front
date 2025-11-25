import { Component, inject } from '@angular/core';
import { ChatService } from '../../../features/gpt/services/chat.service';

@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrl: './chat-list.component.css'
})
export class ChatListComponent {
    chatService = inject(ChatService);
    editingChatId: string | null = null;

    onChatSelect(chatId: string) {
        if (this.editingChatId === chatId) return;
        this.chatService.selectChat(chatId);
    }

    onDeleteChat(chatId: string, event: Event) {
        event.stopPropagation();

        if (confirm('¿Estás seguro de que quieres eliminar este chat?')) {
            this.chatService.deleteChat(chatId).subscribe({
                next: (success) => {
                },
                error: (error) => {
                    console.error('❌ [ChatList] Error deleting chat:', error);
                }
            });
        }
    }

    onRenameChat(chatId: string, event: Event) {
        event.stopPropagation();
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
                    this.editingChatId = null;
                }
            },
            error: (error) => {
                console.error('❌ [ChatList] Error renaming chat:', error);
                this.editingChatId = null;
            }
        });
    }

    cancelEditing() {
        this.editingChatId = null;
    }
}
