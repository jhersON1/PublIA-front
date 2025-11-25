import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TiktokResponse } from '../interfaces';
import { NETWORK_ENDPOINTS } from '../constants/networks';

@Injectable({
  providedIn: 'root',
})
export class Tiktok {

  constructor(private http: HttpClient) { }

  /**
   * Publica un video local (subido por el usuario)
   */
  publishVideo(video: File): Observable<TiktokResponse> {
    const formData = new FormData();
    formData.append('file', video);
    return this.http.post<TiktokResponse>(NETWORK_ENDPOINTS.TIKTOK.POST_VIDEO, formData);
  }

  /**
   * Publica un video desde una URL (generado por IA en Cloudinary)
   */
  publishVideoFromUrl(videoUrl: string): Observable<TiktokResponse> {
    return this.http.post<TiktokResponse>(
      NETWORK_ENDPOINTS.TIKTOK.POST_VIDEO_FROM_URL,
      { video_url: videoUrl }
    );
  }
}
