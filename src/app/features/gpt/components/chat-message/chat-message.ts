import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Message {
  sender: 'user' | 'ai';
  content: string;
  time: string;
  avatar: string;
}

@Component({
  selector: 'app-chat-message',
  imports: [CommonModule],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css',
})
export class ChatMessage {
  @Input({ required: true }) message!: Message;
}
