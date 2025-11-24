import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthStatus, CheckStatusResponse, LoginResponse, User } from '../interfaces/auth';
import { catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>('checking');

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());
  public userId = computed(() => this._currentUser()?._id ?? null);

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  private setAuthentication(user: User, token: string): boolean {
    this._currentUser.set(user);
    this._authStatus.set('authenticated');
    localStorage.setItem('token', token);
    return true;
  }

  login(email: string, password: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { email, password };

    return this.http.post<LoginResponse>(url, body)
      .pipe(
        map((response) => {
          const { token, ...user } = response;
          return this.setAuthentication(user as User, token);
        }),
        catchError(err => throwError(() => err.error.message))
      );
  }

  register(name: string, lastname: string, email: string, password: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/register`;
    const body = { name, lastname, email, password };

    return this.http.post<LoginResponse>(url, body)
      .pipe(
        map(() => true),
        catchError(err => throwError(() => err.error.message))
      );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-status`;
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckStatusResponse>(url, { headers })
      .pipe(
        map((response) => {
          const { token, ...user } = response;
          return this.setAuthentication(user as User, token);
        }),
        catchError(() => {
          this._authStatus.set('not-authenticated');
          return of(false);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set('not-authenticated');
  }
}
