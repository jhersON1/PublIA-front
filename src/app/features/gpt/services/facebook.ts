import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NETWORK_ENDPOINTS } from '../constants/networks';
import { FacebookPostRequest, SocialPostResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class FacebookService {
  private http = inject(HttpClient);

  publishFacebook(body: FacebookPostRequest): Observable<SocialPostResponse> {
    return this.http.post<SocialPostResponse>(NETWORK_ENDPOINTS.FACEBOOK.POST_TEXT, body);
  }
}
