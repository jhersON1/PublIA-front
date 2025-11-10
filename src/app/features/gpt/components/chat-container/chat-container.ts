import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChatMessage} from '../chat-message/chat-message';
import { SocialPostCard, type SocialPost } from '../social-post-card/social-post-card';
import { Message } from '../../interfaces/message.interface';

@Component({
  selector: 'app-chat-container',
  imports: [ ChatMessage, SocialPostCard],
  templateUrl: './chat-container.html',
  styleUrl: './chat-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatContainer {
  messages = input.required<Message[]>();
  socialPosts = input.required<SocialPost[]>();
  showAIResponse = input<boolean>(false);
  isLoading = input<boolean>(false);

  copyToClipboard = output<string>();
  regenerateResponse = output<void>();

  onCopyToClipboard(content: string): void {
    this.copyToClipboard.emit(content);
  }

  onRegenerate(): void {
    this.regenerateResponse.emit();
  }
}
