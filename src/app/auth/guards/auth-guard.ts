import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { AuthStatus } from '../interfaces/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authStatus() === 'authenticated') {
    return true;
  }

  // If checking, we might want to wait or redirect. 
  // For simplicity, if not authenticated (or checking but no token), redirect.
  // Ideally, we wait for 'checking' to resolve.

  if (authService.authStatus() === 'checking') {
    return false;
  }

  router.navigateByUrl('/auth/login');
  return false;
};
