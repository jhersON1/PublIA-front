import { Injectable, signal, inject } from '@angular/core';
import { GptService } from '../gpt.service';
import { ChatService } from '../chat.service';
import { NetworkPost } from '../../interfaces/network-post.interface';

@Injectable({
    providedIn: 'root'
})
export class SocialStateService {
    // Public signals
    socialPosts = signal<NetworkPost[]>([]);
    isLoading = signal<boolean>(false);

    private gptService = inject(GptService);
    private chatService = inject(ChatService);

    generateSocialContent(context: string, messageId?: string, chatId?: string): void {
        this.isLoading.set(true);

        this.gptService.generateSocialContent(context, messageId, chatId).subscribe({
            next: (posts) => {
                this.socialPosts.set(posts);

                // If no posts are loading images/videos, finish loading
                const isGeneratingMedia = posts.some(p => p.isLoadingImage || p.isLoadingVideo);
                if (!isGeneratingMedia) {
                    this.isLoading.set(false);
                }
            },
            error: (error) => {
                console.error('Error al generar contenido social:', error);
                this.clearSocialPosts();
            }
        });
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

    updateWhatsAppPublishType(update: { platform: string; type: 'number' | 'status' }): void {
        this.socialPosts.update(posts =>
            posts.map(post =>
                post.platform === update.platform
                    ? { ...post, whatsappPublishType: update.type }
                    : post
            )
        );
    }

    clearSocialPosts(): void {
        this.socialPosts.set([]);
        this.isLoading.set(false);
    }
}
