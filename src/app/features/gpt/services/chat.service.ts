import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../auth/services/auth';
import { Chat, ChatMessage, CreateChatResponse } from '../interfaces/chat';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly baseUrl: string = environment.apiUrl;
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    // Signals
    private _chats = signal<Chat[]>([]);
    private _currentChatId = signal<string | null>(null);
    private _isLoadingChats = signal<boolean>(false);

    public chats = computed(() => this._chats());
    public currentChatId = computed(() => this._currentChatId());
    public currentChat = computed(() => {
        const chatId = this._currentChatId();
        return this._chats().find(chat => chat._id === chatId) ?? null;
    });
    public isLoadingChats = computed(() => this._isLoadingChats());

    constructor() {
        // Effect to load chats when user logs in
        effect(() => {
            const userId = this.authService.userId();
            if (userId) {
                this.loadUserChats(userId);
            } else {
                this._chats.set([]);
                this._currentChatId.set(null);
            }
        });
    }

    /**
     * Load all chats for the current user
     */
    loadUserChats(userId: string): void {
        this._isLoadingChats.set(true);
        const url = `${this.baseUrl}/chat/user/${userId}`;

        this.http.get<Chat[]>(url)
            .pipe(
                tap(chats => {
                    this._chats.set(chats);

                    // If we have chats and no current chat selected, select the most recent
                    if (chats.length > 0 && !this._currentChatId()) {
                        this._currentChatId.set(chats[0]._id);
                    }
                }),
                catchError(error => {
                    console.error('❌ [ChatService] Error loading chats:', error);
                    console.error('❌ [ChatService] Error details:', {
                        status: error.status,
                        message: error.message,
                        error: error.error
                    });
                    this._chats.set([]);
                    return of([]);
                })
            )
            .subscribe(() => {
                this._isLoadingChats.set(false);
            });
    }

    /**
     * Create a new chat
     */
    createChat(): Observable<Chat> {
        const userId = this.authService.userId();
        if (!userId) {
            console.warn('⚠️ [ChatService] Cannot create chat: No user ID');
            return of({} as Chat);
        }

        const url = `${this.baseUrl}/chat`;
        const body = { userId, title: null };

        return this.http.post<CreateChatResponse>(url, body)
            .pipe(
                tap(newChat => {
                    this._chats.update(chats => [newChat, ...chats]);
                    this._currentChatId.set(newChat._id);
                }),
                catchError(error => {
                    console.error('❌ [ChatService] Error creating chat:', error);
                    console.error('❌ [ChatService] Error details:', {
                        status: error.status,
                        message: error.message,
                        error: error.error
                    });
                    return of({} as Chat);
                })
            );
    }

    /**
     * Delete a chat
     */
    deleteChat(chatId: string): Observable<boolean> {
        const url = `${this.baseUrl}/chat/${chatId}`;

        return this.http.delete(url)
            .pipe(
                tap(() => {
                    this._chats.update(chats => chats.filter(chat => chat._id !== chatId));

                    // If we deleted the current chat, select another one
                    if (this._currentChatId() === chatId) {
                        const remainingChats = this._chats();
                        this._currentChatId.set(remainingChats.length > 0 ? remainingChats[0]._id : null);
                    }
                }),
                map(() => true),
                catchError(error => {
                    console.error('❌ [ChatService] Error deleting chat:', error);
                    console.error('❌ [ChatService] Error details:', {
                        status: error.status,
                        message: error.message,
                        error: error.error
                    });
                    return of(false);
                })
            );
    }

    /**
     * Rename a chat
     */
    renameChat(chatId: string, title: string): Observable<boolean> {
        const url = `${this.baseUrl}/chat/${chatId}`;
        const body = { title };

        return this.http.patch(url, body)
            .pipe(
                tap(() => {
                    this._chats.update(chats =>
                        chats.map(chat =>
                            chat._id === chatId ? { ...chat, title } : chat
                        )
                    );
                }),
                map(() => true),
                catchError(error => {
                    console.error('❌ [ChatService] Error renaming chat:', error);
                    console.error('❌ [ChatService] Error details:', {
                        status: error.status,
                        message: error.message,
                        error: error.error
                    });
                    return of(false);
                })
            );
    }

    /**
     * Select a chat
     */
    selectChat(chatId: string): void {
        this._currentChatId.set(chatId);
    }

    /**
     * Load messages for a specific chat
     */
    loadChatMessages(chatId: string): Observable<ChatMessage[]> {
        const url = `${this.baseUrl}/chat/${chatId}/messages`;

        return this.http.get<ChatMessage[]>(url)
            .pipe(
                tap(messages => {
                }),
                catchError(error => {
                    console.error('❌ [ChatService] Error loading chat messages:', error);
                    console.error('❌ [ChatService] Error details:', {
                        chatId,
                        status: error.status,
                        message: error.message,
                        error: error.error
                    });
                    return of([]);
                })
            );
    }
}
