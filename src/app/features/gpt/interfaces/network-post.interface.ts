export interface NetworkPost {
  platform: string;
  text: string;
  hashtags?: string[];
  character_count?: number;
  suggested_image_prompt?: string;
  suggested_video_prompt?: string;
  tone?: string;
  imageUrl?: string;
  isLoadingImage?: boolean;
  localImageFile?: File;
  videoUrl?: string;
  isLoadingVideo?: boolean;
  whatsappPublishType?: 'number' | 'status'; // 'number' = enviar a número, 'status' = subir a estado
  [key: string]: unknown;
}
