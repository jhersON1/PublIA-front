import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, type Message } from '../chat-message/chat-message';
import { SocialPostCard, type SocialPost } from '../social-post-card/social-post-card';

@Component({
  selector: 'app-chat-container',
  imports: [CommonModule, ChatMessage, SocialPostCard],
  templateUrl: './chat-container.html',
  styleUrl: './chat-container.css',
})
export class ChatContainer {
  @Input({ required: true }) messages: Message[] = [];
  @Input({ required: true }) socialPosts: SocialPost[] = [];
  @Input() showAIResponse: boolean = false;

  @Output() copyToClipboard = new EventEmitter<string>();
  @Output() likeResponse = new EventEmitter<void>();
  @Output() dislikeResponse = new EventEmitter<void>();
  @Output() regenerateResponse = new EventEmitter<void>();

  onCopyToClipboard(content: string): void {
    this.copyToClipboard.emit(content);
  }

  onLike(): void {
    this.likeResponse.emit();
  }

  onDislike(): void {
    this.dislikeResponse.emit();
  }

  onRegenerate(): void {
    this.regenerateResponse.emit();
  }
}
