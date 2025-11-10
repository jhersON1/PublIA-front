import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Message {
  sender: 'user' | 'ai';
  content: string;
  time: string;
  avatar: string;
  responseId?: string; // ID de respuesta de la IA para mantener el hilo
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
