import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { ChatContainer } from './components/chat-container/chat-container';
import { ChatInput } from './components/chat-input/chat-input';
import type { Message } from './components/chat-message/chat-message';
import type { SocialPost } from './components/social-post-card/social-post-card';

@Component({
  selector: 'app-gpt',
  imports: [CommonModule, Sidebar, ChatContainer, ChatInput],
  templateUrl: './gpt.html',
  styleUrl: './gpt.css',
})
export class Gpt {
  messages: Message[] = [
    {
      sender: 'user',
      content: 'el jueves 3 de mayo empieza las inscripciones',
      time: '10:30 AM',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG0-rnfDL9KvPqLiOm5wriU1wDs1rmvwlPjtvf4h9Dx_3srAOllLv3fxvMDEL1DcffIzxpydAJUqsodMGARd9c0Ppjv0XOnmYRwXE4OoGB2yzmU_UZeaDkOyW_GGNtcFrZqjhpfGRS8xV_RoEThdZbxcQweVdVTpvlHJrYzo9PySnnMF8yhPdjY7tba9ve71YO9R69AEoY7WhzoGd1gcAh4JFHa330oSxlYFlloyPnrJD3AHeW5UtB_fvjc3F6ZzNJqfdpk99IDzKu'
    }
  ];

  socialPosts: SocialPost[] = [
    {
      platform: 'Facebook',
      content: '¡Atención! 📣 Las inscripciones abren este jueves 3 de mayo. ¡No te quedes fuera y asegura tu lugar! Marca tu calendario y prepárate para dar el siguiente paso. #InscripcionesAbiertas #Oportunidad',
      icon: 'facebook',
      color: '#1877F2'
    },
    {
      platform: 'Instagram',
      content: '¡La espera terminó! 🚀 Este jueves 3 de mayo inician las inscripciones. ¿Estás listo para un nuevo comienzo?\n\n#Inscripciones2024 #NuevoReto #Imperdible #SaveTheDate',
      icon: 'instagram',
      color: 'gradient'
    },
    {
      platform: 'TikTok',
      content: 'POV: Te enteras que las inscripciones abren el 3 de mayo. ¡Corre! 🏃‍♀️💨 #FYP #Inscripciones #NoTeLoPierdas #Viral',
      icon: 'tiktok',
      color: '#000000'
    },
    {
      platform: 'LinkedIn',
      content: 'Nos complace anunciar que el período de inscripciones para [Nombre del Programa/Curso] dará inicio el próximo jueves 3 de mayo. Esta es una excelente oportunidad para impulsar su desarrollo profesional. Para más información, visite nuestro sitio web.\n\n#DesarrolloProfesional #Networking #Oportunidades #Carrera',
      icon: 'linkedin',
      color: '#0A66C2'
    },
    {
      platform: 'WhatsApp',
      content: '¡Hola! 👋 Te recordamos que las inscripciones comienzan este jueves 3 de mayo. ¡No dejes pasar la oportunidad! Agenda la fecha. 🗓️',
      icon: 'whatsapp',
      color: '#25D366'
    }
  ];

  showAIResponse: boolean = true;

  // Handlers for chat container events
  handleCopyToClipboard(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Copied to clipboard:', content);
      // Aquí puedes agregar una notificación toast
    });
  }

  handleLikeResponse(): void {
    console.log('Response liked');
    // Aquí puedes agregar lógica para enviar feedback al backend
  }

  handleDislikeResponse(): void {
    console.log('Response disliked');
    // Aquí puedes agregar lógica para enviar feedback al backend
  }

  handleRegenerateResponse(): void {
    console.log('Regenerating response');
    // Aquí puedes agregar lógica para regenerar la respuesta
  }

  // Handlers for chat input events
  handleSendMessage(message: string): void {
    console.log('Sending message:', message);
    
    const newMessage: Message = {
      sender: 'user',
      content: message,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG0-rnfDL9KvPqLiOm5wriU1wDs1rmvwlPjtvf4h9Dx_3srAOllLv3fxvMDEL1DcffIzxpydAJUqsodMGARd9c0Ppjv0XOnmYRwXE4OoGB2yzmU_UZeaDkOyW_GGNtcFrZqjhpfGRS8xV_RoEThdZbxcQweVdVTpvlHJrYzo9PySnnMF8yhPdjY7tba9ve71YO9R69AEoY7WhzoGd1gcAh4JFHa330oSxlYFlloyPnrJD3AHeW5UtB_fvjc3F6ZzNJqfdpk99IDzKu'
    };
    
    this.messages.push(newMessage);
    
    // Aquí puedes agregar la lógica para enviar el mensaje al backend/API
  }

  handleAttachFile(): void {
    console.log('Attach file clicked');
    // Aquí puedes agregar lógica para abrir un file picker
  }

  handleVoiceInput(): void {
    console.log('Voice input clicked');
    // Aquí puedes agregar lógica para capturar input de voz
  }
}

