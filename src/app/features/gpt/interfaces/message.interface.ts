export interface Message {
  sender: 'user' | 'ai' | 'ai-posts';
  content: string;
  time: string;
  avatar: string;
  responseId?: string;
  type?: 'text' | 'image' | 'video';
  mediaUrl?: string;
}
