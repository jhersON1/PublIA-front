export interface SocialPostResponse {
  ok: boolean;
  platform: string;
  id: string;
  permalink?: string;
  status: 'published';
}
