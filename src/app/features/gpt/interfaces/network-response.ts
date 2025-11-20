export interface SocialPostResponse {
  ok: boolean;
  platform: string;
  id: string;
  permalink?: string;
  status: 'published';
}

export interface TiktokResponse {
  success: boolean;
  message: string;
  publish_id: string;
}

export interface WhatsAppResponse {
  ok: boolean;
  platform: string;
  id: string;
  status: string;
}