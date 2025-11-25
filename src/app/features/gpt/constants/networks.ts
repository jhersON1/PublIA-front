import { environment } from '../../../../environments/environment';

export const NETWORK_ENDPOINTS = {
    FACEBOOK: {
        POST_TEXT: `${environment.apiUrl}/meta/facebook/post-text`
    },
    INSTAGRAM: {
        POST_IMAGE: `${environment.apiUrl}/meta/instagram/post-image`
    },
    WHATSAPP: {
        SEND_TEMPLATE: `${environment.apiUrl}/meta/whatsapp/send-template`,
        SEND_TEXT: `${environment.apiUrl}/meta/whatsapp/send-text`,
        POST_STATUS: `${environment.apiUrl}/whatsapp/status`
    },
    LINKEDIN: {
        POST_ARTICLE: `${environment.apiUrl}/linkedin/post-article`
    },
    TIKTOK: {
        POST_VIDEO: `${environment.apiUrl}/tiktok/publish-tiktok`,
        POST_VIDEO_FROM_URL: `${environment.apiUrl}/tiktok/publish-tiktok-from-url`
    }
};
