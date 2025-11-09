import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SocialPost {
  platform: string;
  content: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-social-post-card',
  imports: [CommonModule],
  templateUrl: './social-post-card.html',
  styleUrl: './social-post-card.css',
})
export class SocialPostCard {
  @Input({ required: true }) post!: SocialPost;
  @Output() copyContent = new EventEmitter<string>();

  get formattedContent(): string {
    return this.post.content.replace(/\n/g, '<br>');
  }

  onCopy(): void {
    this.copyContent.emit(this.post.content);
  }
}
