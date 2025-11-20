export interface WhatsAppPostTemplateRequest {
    to: string;
    templateName: string;
    languageCode: string;
}

export interface WhatsAppPostTextRequest {
    messaging_product: string;
    to: string;
    type: string;
    text: {
        preview_url: boolean;
        body: string;
    };
}