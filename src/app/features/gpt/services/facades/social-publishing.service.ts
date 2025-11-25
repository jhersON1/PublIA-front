import { Injectable } from '@angular/core';
import { FacebookService } from '../facebook';
import { LinkedInService } from '../linkedin';
import { InstagramService } from '../instagram';
import { CloudinaryService } from '../cloudinary';
import { WhatsAppService } from '../whatsapp';
import { Tiktok } from '../tiktok';
import { NetworkPost } from '../../interfaces/network-post.interface';
import { PLATFORMS } from '../../constants/gpt.constants';
import { SocialPostResponse } from '../../interfaces/network-response';
import { Observable, merge, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

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

    publishAll(posts: NetworkPost[]): Observable<SocialPostResponse> {
        const observables: Observable<SocialPostResponse>[] = [];

        posts.forEach(post => {
            let obs: Observable<SocialPostResponse> | null = null;
            switch (post.platform.toLowerCase()) {
                case PLATFORMS.FACEBOOK:
                    obs = this.publishToFacebook(post);
                    break;
                case PLATFORMS.LINKEDIN:
                    obs = this.publishToLinkedIn(post);
                    break;
                case PLATFORMS.INSTAGRAM:
                    obs = this.publishToInstagram(post);
                    break;
                case PLATFORMS.WHATSAPP:
                    obs = this.publishToWhatsApp(post);
                    break;
                case PLATFORMS.TIKTOK:
                    obs = this.publishToTikTok(post);
                    break;
            }
            if (obs) {
                observables.push(obs);
            }
        });

        return merge(...observables);
    }

    private publishToFacebook(post: NetworkPost): Observable<SocialPostResponse> {
        return this.facebookService.publishFacebook({ text: post.text }).pipe(
            catchError(error => {
                console.error('Error publishing to Facebook:', error);
                return of({ ok: false, platform: PLATFORMS.FACEBOOK, id: '', status: 'error' } as any);
            })
        );
    }

    private publishToLinkedIn(post: NetworkPost): Observable<SocialPostResponse> {
        return this.linkedInService.publishLinkedIn({
            text: post.text,
            articleUrl: 'https://blog.linkedin.com/',
            articleTitle: 'Official LinkedIn Blog',
            articleDescription: 'Your source for insights and information about LinkedIn.'
        }).pipe(
            catchError(error => {
                console.error('Error publishing to LinkedIn:', error);
                return of({ ok: false, platform: PLATFORMS.LINKEDIN, id: '', status: 'error' } as any);
            })
        );
    }

    private publishToInstagram(post: NetworkPost): Observable<SocialPostResponse> {
        if (post.localImageFile) {
            return this.cloudinaryService.uploadFile(post.localImageFile).pipe(
                switchMap(cloudinaryResponse =>
                    this.instagramService.publishInstagram({
                        imageUrl: cloudinaryResponse.secure_url,
                        caption: post.text
                    })
                ),
                catchError(error => {
                    console.error('Error publishing to Instagram:', error);
                    return of({ ok: false, platform: PLATFORMS.INSTAGRAM, id: '', status: 'error' } as any);
                })
            );
        } else if (post.imageUrl) {
            return this.instagramService.publishInstagram({
                imageUrl: post.imageUrl,
                caption: post.text
            }).pipe(
                catchError(error => {
                    console.error('Error publishing to Instagram:', error);
                    return of({ ok: false, platform: PLATFORMS.INSTAGRAM, id: '', status: 'error' } as any);
                })
            );
        } else {
            console.warn('Instagram post has no image to publish');
            return of({ ok: false, platform: PLATFORMS.INSTAGRAM, id: '', status: 'error' } as any);
        }
    }

    private publishToWhatsApp(post: NetworkPost): Observable<SocialPostResponse> {
        const publishType = post.whatsappPublishType || 'status'; // Default: 'status'

        return this.whatsAppService.publish(post.text, publishType).pipe(
            map(response => ({
                ok: response.ok,
                platform: PLATFORMS.WHATSAPP,
                id: response.id,
                status: 'published' as const
            })),
            catchError(error => {
                const action = publishType === 'number' ? 'enviar mensaje' : 'publicar estado';
                console.error(`Error al ${action} en WhatsApp:`, error);
                return of({ ok: false, platform: PLATFORMS.WHATSAPP, id: '', status: 'error' } as any);
            })
        );
    }

    private publishToTikTok(post: NetworkPost): Observable<SocialPostResponse> {
        // Prioridad: archivo local > video generado por IA
        let obs: Observable<any>;

        if (post.localImageFile) {
            // Video subido localmente
            obs = this.tiktokService.publishVideo(post.localImageFile);
        } else if (post.videoUrl) {
            // Video generado por IA (URL de Cloudinary)
            obs = this.tiktokService.publishVideoFromUrl(post.videoUrl);
        } else {
            console.warn('TikTok post has no video file or URL to publish');
            return of({ ok: false, platform: PLATFORMS.TIKTOK, id: '', status: 'error' } as any);
        }

        return obs.pipe(
            map(response => ({
                ok: response.success,
                platform: PLATFORMS.TIKTOK,
                id: response.publish_id,
                status: 'published' as const
            })),
            catchError(error => {
                console.error('Error publishing to TikTok:', error);
                return of({ ok: false, platform: PLATFORMS.TIKTOK, id: '', status: 'error' } as any);
            })
        );
    }
}
