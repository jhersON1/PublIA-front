import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NETWORK_ENDPOINTS } from '../constants/networks';
import { LinkedInPostRequest, SocialPostResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class LinkedInService {
  private http = inject(HttpClient);

  publishLinkedIn(body: LinkedInPostRequest): Observable<SocialPostResponse> {
    return this.http.post<SocialPostResponse>(NETWORK_ENDPOINTS.LINKEDIN.POST_ARTICLE, body);
  }
}
