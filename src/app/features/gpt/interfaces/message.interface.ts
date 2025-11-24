export interface Message {
  sender: 'user' | 'ai';
  content: string;
  time: string;
  avatar: string;
  responseId?: string;
  type?: 'text' | 'image' | 'video';
  mediaUrl?: string;
}
