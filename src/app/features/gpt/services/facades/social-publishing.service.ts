import { Injectable } from '@angular/core';
import { FacebookService } from '../facebook';
import { LinkedInService } from '../linkedin';
import { InstagramService } from '../instagram';
import { CloudinaryService } from '../cloudinary';
import { WhatsAppService } from '../whatsapp';
import { Tiktok } from '../tiktok';
import { NetworkPost } from '../../interfaces/network-post.interface';
import { PLATFORMS } from '../../constants/gpt.constants';

@Injectable({
    providedIn: 'root'
})
export class SocialPublishingService {

    constructor(
        private facebookService: FacebookService,
        private linkedInService: LinkedInService,
        private instagramService: InstagramService,
        private cloudinaryService: CloudinaryService,
        private whatsAppService: WhatsAppService,
        private tiktokService: Tiktok
    ) { }

    publishAll(posts: NetworkPost[]): void {
        posts.forEach(post => {
            switch (post.platform.toLowerCase()) {
                case PLATFORMS.FACEBOOK:
                    this.publishToFacebook(post);
                    break;
                case PLATFORMS.LINKEDIN:
                    this.publishToLinkedIn(post);
                    break;
                case PLATFORMS.INSTAGRAM:
                    this.publishToInstagram(post);
                    break;
                case PLATFORMS.WHATSAPP:
                    this.publishToWhatsApp(post);
                    break;
                case PLATFORMS.TIKTOK:
                    this.publishToTikTok(post);
                    break;
            }
        });
    }

    private publishToFacebook(post: NetworkPost): void {
        this.facebookService.publishFacebook({ text: post.text }).subscribe({
            next: (response) => {
            },
            error: (error) => {
                console.error('Error publishing to Facebook:', error);
            }
        });
    }

    private publishToLinkedIn(post: NetworkPost): void {
        this.linkedInService.publishLinkedIn({
            text: post.text,
            articleUrl: 'https://blog.linkedin.com/',
            articleTitle: 'Official LinkedIn Blog',
            articleDescription: 'Your source for insights and information about LinkedIn.'
        }).subscribe({
            next: (response) => {
            },
            error: (error) => {
                console.error('Error publishing to LinkedIn:', error);
            }
        });
    }

    private publishToInstagram(post: NetworkPost): void {
        if (post.localImageFile) {
            this.cloudinaryService.uploadFile(post.localImageFile).subscribe({
                next: (cloudinaryResponse) => {
                    this.instagramService.publishInstagram({
                        imageUrl: cloudinaryResponse.secure_url,
                        caption: post.text
                    }).subscribe({
                        next: (response) => {
                        },
                        error: (error) => {
                            console.error('Error publishing to Instagram:', error);
                        }
                    });
                },
                error: (error) => {
                    console.error('Error uploading image to Cloudinary:', error);
                }
            });
        } else if (post.imageUrl) {
            this.instagramService.publishInstagram({
                imageUrl: post.imageUrl,
                caption: post.text
            }).subscribe({
                next: (response) => {
                },
                error: (error) => {
                    console.error('Error publishing to Instagram:', error);
                }
            });
        } else {
            console.warn('Instagram post has no image to publish');
        }
    }

    private publishToWhatsApp(post: NetworkPost): void {
        const publishType = post.whatsappPublishType || 'status'; // Default: 'status'

        this.whatsAppService.publish(post.text, publishType).subscribe({
            next: (response) => {
            },
            error: (error) => {
                const action = publishType === 'number' ? 'enviar mensaje' : 'publicar estado';
                console.error(`Error al ${action} en WhatsApp:`, error);
            }
        });
    }

    private publishToTikTok(post: NetworkPost): void {
        // Prioridad: archivo local > video generado por IA
        if (post.localImageFile) {
            // Video subido localmente
            this.tiktokService.publishVideo(post.localImageFile).subscribe({
                next: (response) => {
                },
                error: (error) => {
                    console.error('Error publishing local video to TikTok:', error);
                }
            });
        } else if (post.videoUrl) {
            // Video generado por IA (URL de Cloudinary)
            this.tiktokService.publishVideoFromUrl(post.videoUrl).subscribe({
                next: (response) => {
                },
                error: (error) => {
                    console.error('Error publishing AI-generated video to TikTok:', error);
                }
            });
        } else {
            console.warn('TikTok post has no video file or URL to publish');
        }
    }
}
