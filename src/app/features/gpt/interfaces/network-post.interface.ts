export interface NetworkPost {
  platform: string;
  text: string;
  hashtags?: string[];
  character_count?: number;
  suggested_image_prompt?: string;
  tone?: string;
  imageUrl?: string;
  isLoadingImage?: boolean;
  localImageFile?: File;
  videoUrl?: string;
  isLoadingVideo?: boolean;
  [key: string]: unknown;
}
