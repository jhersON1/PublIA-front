import { environment } from "../../../../environments/environment";

export const AVATAR_URLS = {
    USER: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG0-rnfDL9KvPqLiOm5wriU1wDs1rmvwlPjtvf4h9Dx_3srAOllLv3fxvMDEL1DcffIzxpydAJUqsodMGARd9c0Ppjv0XOnmYRwXE4OoGB2yzmU_UZeaDkOyW_GGNtcFrZqjhpfGRS8xV_RoEThdZbxcQweVdVTpvlHJrYzo9PySnnMF8yhPdjY7tba9ve71YO9R69AEoY7WhzoGd1gcAh4JFHa330oSxlYFlloyPnrJD3AHeW5UtB_fvjc3F6ZzNJqfdpk99IDzKu',
    AI: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdhvxftuCM4RaZTiXoLj1pqh7ALtTFyquVCfHf9iRbgjZ3E_GptnEWP_ZC8FfRfYf8ZG5Y57biMT6CvRqWTArTMmLUHKnbeYFjnKITdxEqFuSQw_SO0cMy48nbRHdhXLVGVi-cG3VSVBnJFtX36eBysrgnCsru_-PPEfKg7rTFMPb7-1bqCIWMqXOUK0L0HLNno1fwLfkPWTuSxbQ8SUtJOjkXQRkeNvFJTsgsvVkLbmNNpmpFp-4T40xcaLu9_FUXagcYR_mftybL'
};

export const PLATFORMS = {
    INSTAGRAM: 'instagram',
    FACEBOOK: 'facebook',
    WHATSAPP: 'whatsapp',
    LINKEDIN: 'linkedin',
    TIKTOK: 'tiktok'
};

export const GPT_API_URLS = {
    BASE_URL: `${environment.apiUrl}/gpt`,
    get CHAT() { return `${this.BASE_URL}/chat`; },
    get GENERATE_POSTS() { return `${this.BASE_URL}/generate-posts`; },
    get GENERATE_IMAGE() { return `${this.BASE_URL}/generate-image`; },
    get VIDEO_GENERATE() { return `${this.BASE_URL}/veo/generate`; },
    get VIDEO_STATUS() { return `${this.BASE_URL}/veo/status`; }
};

