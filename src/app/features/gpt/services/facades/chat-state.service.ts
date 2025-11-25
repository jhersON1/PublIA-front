import { Injectable, signal, effect, inject } from '@angular/core';
import { GptService, ChatResponse } from '../gpt.service';
import { SidebarService } from '../../../../services/sidebar.service';
import { ClipboardService } from '../../../../shared/services/clipboard.service';
import { ChatService } from '../chat.service';
import { Message } from '../../interfaces/message.interface';
import { AVATAR_URLS } from '../../constants/gpt.constants';
import { SocialStateService } from './social-state.service';
import { NetworkPost } from '../../interfaces/network-post.interface';

@Injectable({
    providedIn: 'root'
})
export class ChatStateService {

    messages = signal<Message[]>([]);

    showAIResponse = signal<boolean>(false);
    isLoading = signal<boolean>(false);

    // Private properties
    private lastResponseId: string = '';
    private isCreatingChat: boolean = false;

    private chatService = inject(ChatService);
    private socialStateService = inject(SocialStateService);

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

        // Effect to load messages when chat selection changes
        effect(() => {
            const chatId = this.chatService.currentChatId();

            if (chatId) {
                if (this.isCreatingChat) {
                    this.isCreatingChat = false;
                    return;
                }
                this.loadChatMessages(chatId);
            } else {
                this.messages.set([]);
                this.socialStateService.clearSocialPosts();
            }
        });
    }

    // Public methods

    copyToClipboard(content: string): void {
        this.clipboardService.copyToClipboard(content);
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

        // Check if we need to create a chat first
        const currentChatId = this.chatService.currentChatId();

        if (!currentChatId) {
            this.isCreatingChat = true;
            this.chatService.createChat().subscribe({
                next: (newChat) => {
                    this.sendMessageToAPI(prompt, newChat._id);
                },
                error: (error) => {
                    console.error('❌ [ChatStateService] Error creating chat:', error);
                    this.isCreatingChat = false;
                    this.handleChatError(error);
                }
            });
        } else {
            this.sendMessageToAPI(prompt, currentChatId);
        }
    }

    private sendMessageToAPI(prompt: string, chatId: string): void {

        this.gptService.sendMessage(prompt, this.lastResponseId, chatId).subscribe({
            next: (response) => this.handleChatSuccess(response),
            error: (error) => this.handleChatError(error),
        });
    }

    newChat(): void {
        this.messages.set([]);
        this.socialStateService.clearSocialPosts();
        this.lastResponseId = '';
        this.showAIResponse.set(false);
        this.chatService.selectChat(null as any); // Set currentChatId to null
    }

    // Private methods

    private addMessage(sender: 'user' | 'ai' | 'ai-posts', content: string, responseId?: string): void {
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
        // If we have context (posts), we treat this as an 'ai-posts' message
        const sender = this.hasContext(response.context) ? 'ai-posts' : 'ai';
        const messageId = response.messageId;

        this.addMessage(sender, response.message, messageId);
        this.showAIResponse.set(true);
        this.lastResponseId = response.responseId;
        this.isLoading.set(false);

        if (this.hasContext(response.context)) {
            const currentChatId = this.chatService.currentChatId() || undefined;
            this.socialStateService.generateSocialContent(response.context, messageId, currentChatId);
            return;
        }

        this.socialStateService.clearSocialPosts();
    }

    private handleChatError(error: unknown): void {
        console.error('Error al enviar mensaje:', error);
        this.addMessage('ai', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
    }

    private hasContext(context?: string | null): boolean {
        return Boolean(context?.trim());
    }

    private loadChatMessages(chatId: string): void {
        this.chatService.loadChatMessages(chatId).subscribe({
            next: (chatMessages) => {
                const messages: Message[] = [];
                let lastAiPosts: NetworkPost[] = [];

                chatMessages.forEach(msg => {
                    if (msg.sender === 'ai-posts') {
                        try {
                            const parsedContent = JSON.parse(msg.content);
                            const posts = Object.values(parsedContent.networks || {}) as any[];

                            // Map to NetworkPost interface
                            lastAiPosts = posts.map(post => ({
                                ...post,
                                // Map mediaUrl to specific fields based on platform
                                imageUrl: post.platform.toLowerCase() === 'instagram' ? post.mediaUrl : undefined,
                                videoUrl: post.platform.toLowerCase() === 'tiktok' ? post.mediaUrl : undefined,
                                // Reset loading states
                                isLoadingImage: false,
                                isLoadingVideo: false
                            }));
                        } catch (e) {
                            console.error('❌ Error parsing ai-posts content:', e);
                        }
                    } else {
                        messages.push({
                            sender: msg.sender,
                            content: msg.content,
                            time: new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                            avatar: msg.sender === 'user' ? AVATAR_URLS.USER : AVATAR_URLS.AI,
                            type: msg.type,
                            mediaUrl: msg.mediaUrl || undefined
                        });
                    }
                });

                this.messages.set(messages);

                // If we found ai-posts, set them in social state and show AI response
                if (lastAiPosts.length > 0) {
                    this.socialStateService.socialPosts.set(lastAiPosts);
                    this.showAIResponse.set(true);
                } else {
                    this.socialStateService.clearSocialPosts();
                    this.showAIResponse.set(messages.length > 0 && messages[messages.length - 1].sender === 'ai');
                }
            },
            error: (error) => {
                console.error('❌ [ChatStateService] Error loading chat messages:', error);
                this.messages.set([]);
                this.socialStateService.clearSocialPosts();
            }
        });
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
