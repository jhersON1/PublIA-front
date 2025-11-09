import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  messageInput: string = '';

  @Output() sendMessage = new EventEmitter<string>();
  @Output() attachFile = new EventEmitter<void>();
  @Output() voiceInput = new EventEmitter<void>();

  handleEnter(event: KeyboardEvent): void {
    event.preventDefault();
    this.onSend();
  }

  onSend(): void {
    if (this.messageInput.trim()) {
      this.sendMessage.emit(this.messageInput);
      this.messageInput = '';
    }
  }

  onAttachFile(): void {
    this.attachFile.emit();
  }

  onVoiceInput(): void {
    this.voiceInput.emit();
  }
}
