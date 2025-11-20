import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NETWORK_ENDPOINTS } from '../constants/networks';
import { InstagramPostRequest, SocialPostResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private http = inject(HttpClient);

  publishInstagram(body: InstagramPostRequest): Observable<SocialPostResponse> {
    return this.http.post<SocialPostResponse>(NETWORK_ENDPOINTS.INSTAGRAM.POST_IMAGE, body);
  }
}
