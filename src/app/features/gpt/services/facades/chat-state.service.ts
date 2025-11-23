import { Injectable, signal, effect, computed } from '@angular/core';
import { GptService, ChatResponse } from '../gpt.service';
import { SidebarService } from '../../../../services/sidebar.service';
import { ClipboardService } from '../../../../shared/services/clipboard.service';
import { Message } from '../../interfaces/message.interface';
import { NetworkPost } from '../../interfaces/network-post.interface';
import { AVATAR_URLS } from '../../constants/gpt.constants';

@Injectable({
    providedIn: 'root'
})
export class ChatStateService {
    // Public signals
    messages = signal<Message[]>([]);
    socialPosts = signal<NetworkPost[]>([]);
    showAIResponse = signal<boolean>(false);
    isLoading = signal<boolean>(false);

    // Private properties
    private lastResponseId: string = '';

    constructor(
        private gptService: GptService,
        private sidebarService: SidebarService,
        private clipboardService: ClipboardService
    ) {
        // Effect to react to new chat trigger
        effect(() => {
            const trigger = this.sidebarService.getNewChatTrigger()();
            if (trigger > 0) {
                this.newChat();
            }
        });
    }

    // Public methods

    copyToClipboard(content: string): void {
        this.clipboardService.copyToClipboard(content);
    }

    updatePost(update: { platform: string; text: string }): void {
        this.socialPosts.update(posts =>
            posts.map(post =>
                post.platform === update.platform
                    ? { ...post, text: update.text }
                    : post
            )
        );
    }

    updateImageFile(update: { platform: string; file: File }): void {
        this.socialPosts.update(posts =>
            posts.map(post =>
                post.platform === update.platform
                    ? { ...post, localImageFile: update.file }
                    : post
            )
        );
    }

    regenerateResponse(): void {
        if (this.messages().length < 2) {
            return;
        }

        const lastUserMessage = this.getLastMessageBySender('user');
        const lastMessage = this.getLastMessage();

        if (!lastUserMessage || lastMessage?.sender !== 'ai') {
            return;
        }

        this.removeLastMessage();
        this.sendMessage(lastUserMessage.content);
    }

    sendMessage(message: string): void {
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

    newChat(): void {
        this.messages.set([]);
        this.socialPosts.set([]);
        this.lastResponseId = '';
        this.showAIResponse.set(false);
    }

    // Private methods

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

    private generateSocialContent(context: string): void {
        this.gptService.generateSocialContent(context).subscribe({
            next: (posts) => {
                this.socialPosts.set(posts);

                // If no posts are loading images, finish loading
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

    private handleChatError(error: unknown): void {
        console.error('Error al enviar mensaje:', error);
        this.addMessage('ai', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
    }

    private hasContext(context?: string | null): boolean {
        return Boolean(context?.trim());
    }

    private clearSocialPosts(): void {
        this.socialPosts.set([]);
        this.isLoading.set(false);
    }

    private getLastMessage(): Message | undefined {
        const list = this.messages();
        return list[list.length - 1];
    }

    private getLastMessageBySender(sender: 'user' | 'ai'): Message | undefined {
        return [...this.messages()].reverse().find(message => message.sender === sender);
    }

    private removeLastMessage(): void {
        this.messages.update(msgs => msgs.slice(0, -1));
    }
}
