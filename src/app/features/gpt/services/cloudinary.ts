import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { CloudinaryUploadResponse } from '../interfaces/cloudinary';

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {
    private readonly UPLOAD_URL = `${environment.apiUrl}/cloudinary/upload-file`;

    constructor(private http: HttpClient) { }

    uploadFile(file: File): Observable<CloudinaryUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<CloudinaryUploadResponse>(this.UPLOAD_URL, formData);
    }
}
