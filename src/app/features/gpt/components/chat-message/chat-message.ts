import { Component, input } from '@angular/core';
import { Message } from '../interfaces/message.interface';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css',
})
export class ChatMessage {
  message = input.required<Message>();
}
