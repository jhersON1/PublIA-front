import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TiktokResponse } from '../interfaces';
import { NETWORK_ENDPOINTS } from '../constants/networks';

@Injectable({
  providedIn: 'root',
})
export class Tiktok {

  constructor(private http: HttpClient) { }

  publishVideo(video: File | string): Observable<TiktokResponse> {
    if (typeof video === 'string') {
      return this.http.get(video, { responseType: 'blob' }).pipe(
        switchMap(blob => {
          const file = new File([blob], 'video.mp4', { type: blob.type });
          const formData = new FormData();
          formData.append('file', file);
          return this.http.post<TiktokResponse>(NETWORK_ENDPOINTS.TIKTOK.POST_VIDEO, formData);
        })
      );
    }

    const formData = new FormData();
    formData.append('file', video);

    return this.http.post<TiktokResponse>(NETWORK_ENDPOINTS.TIKTOK.POST_VIDEO, formData);
  }
}
