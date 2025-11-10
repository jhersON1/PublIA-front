import { Component, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  messageInput = model<string>('');

  sendMessage = output<string>();
  attachFile = output<void>();
  voiceInput = output<void>();

  handleEnter(event: KeyboardEvent): void {
    event.preventDefault();
    this.onSend();
  }

  onSend(): void {
    if (this.messageInput().trim()) {
      this.sendMessage.emit(this.messageInput());
      this.messageInput.set('');
    }
  }

  onAttachFile(): void {
    this.attachFile.emit();
  }

  onVoiceInput(): void {
    this.voiceInput.emit();
  }
}
