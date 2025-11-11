export interface NetworkPost {
  platform: string;
  text: string;
  hashtags?: string[];
  character_count?: number;
  suggested_image_prompt?: string;
  tone?: string;
  [key: string]: unknown;
}
