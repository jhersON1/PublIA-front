import { Injectable, signal, effect, inject } from '@angular/core';
import { GptService, ChatResponse } from '../gpt.service';
import { SidebarService } from '../../../../services/sidebar.service';
import { ClipboardService } from '../../../../shared/services/clipboard.service';
import { ChatService } from '../chat.service';
import { Message } from '../../interfaces/message.interface';
import { AVATAR_URLS } from '../../constants/gpt.constants';
import { SocialStateService } from './social-state.service';

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
            console.log('🔵 [ChatStateService] Current chat changed:', chatId);

            if (chatId) {
                if (this.isCreatingChat) {
                    console.log('🔵 [ChatStateService] Chat creation in progress, preserving local messages');
                    this.isCreatingChat = false;
                    return;
                }
                console.log('🔵 [ChatStateService] Loading messages for chat:', chatId);
                this.loadChatMessages(chatId);
            } else {
                console.log('🔵 [ChatStateService] No chat selected, clearing messages');
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

        console.log('🔵 [ChatStateService] Sending message');
        console.log('🔵 [ChatStateService] Current chatId:', this.chatService.currentChatId());

        // Check if we need to create a chat first
        const currentChatId = this.chatService.currentChatId();

        if (!currentChatId) {
            console.log('🔵 [ChatStateService] No active chat, creating new chat first');
            this.isCreatingChat = true;
            this.chatService.createChat().subscribe({
                next: (newChat) => {
                    console.log('✅ [ChatStateService] Chat created, now sending message with chatId:', newChat._id);
                    this.sendMessageToAPI(prompt, newChat._id);
                },
                error: (error) => {
                    console.error('❌ [ChatStateService] Error creating chat:', error);
                    this.isCreatingChat = false;
                    this.handleChatError(error);
                }
            });
        } else {
            console.log('✅ [ChatStateService] Using existing chatId:', currentChatId);
            this.sendMessageToAPI(prompt, currentChatId);
        }
    }

    private sendMessageToAPI(prompt: string, chatId: string): void {
        console.log('🔵 [ChatStateService] Calling API with:', { prompt, chatId });

        this.gptService.sendMessage(prompt, this.lastResponseId, chatId).subscribe({
            next: (response) => this.handleChatSuccess(response),
            error: (error) => this.handleChatError(error),
        });
    }

    newChat(): void {
        console.log('🔵 [ChatStateService] New chat triggered - clearing state only');
        this.messages.set([]);
        this.socialStateService.clearSocialPosts();
        this.lastResponseId = '';
        this.showAIResponse.set(false);
        this.chatService.selectChat(null as any); // Set currentChatId to null
        console.log('✅ [ChatStateService] State cleared, currentChatId now null');
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
        this.isLoading.set(false);

        if (this.hasContext(response.context)) {
            this.socialStateService.generateSocialContent(response.context);
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
        console.log('🔵 [ChatStateService] Loading messages for chatId:', chatId);

        this.chatService.loadChatMessages(chatId).subscribe({
            next: (chatMessages) => {
                console.log('✅ [ChatStateService] Loaded chat messages:', chatMessages);

                // Convert ChatMessage[] to Message[]
                const messages: Message[] = chatMessages.map(msg => ({
                    sender: msg.sender,
                    content: msg.content,
                    time: new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    avatar: msg.sender === 'user' ? AVATAR_URLS.USER : AVATAR_URLS.AI,
                    type: msg.type,
                    mediaUrl: msg.mediaUrl || undefined
                }));

                this.messages.set(messages);
                console.log('✅ [ChatStateService] Messages converted and set:', messages);
            },
            error: (error) => {
                console.error('❌ [ChatStateService] Error loading chat messages:', error);
                this.messages.set([]);
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
