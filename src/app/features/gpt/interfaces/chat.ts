export interface Chat {
    _id: string;
    userId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ChatMessage {
    _id: string;
    chatId: string;
    sender: 'user' | 'ai' | 'ai-posts';
    content: string;
    type: 'text' | 'image' | 'video';
    mediaUrl?: string | null;
    createdAt: string;
}

export interface CreateChatResponse {
    _id: string;
    userId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
}
