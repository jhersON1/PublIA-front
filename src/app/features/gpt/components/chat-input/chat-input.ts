import { Component, output, model, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  isDisabled = input<boolean>(false);

  messageInput = model<string>('');

  sendMessage = output<string>();
  attachFile = output<void>();
  voiceInput = output<void>();

  handleEnter(event: KeyboardEvent): void {
    event.preventDefault();
    this.onSend();
  }

  onSend(): void {
    if (this.messageInput().trim() && !this.isDisabled()) {
      this.sendMessage.emit(this.messageInput());
      this.messageInput.set('');
    }
  }

  onAttachFile(): void {
    if (!this.isDisabled()) {
      this.attachFile.emit();
    }
  }

  onVoiceInput(): void {
    if (!this.isDisabled()) {
      this.voiceInput.emit();
    }
  }
}
