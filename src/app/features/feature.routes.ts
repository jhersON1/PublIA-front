import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth-guard';

export const featureRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'gpt',
        pathMatch: 'full'
      },
      {
        path: 'gpt',
        loadComponent: () => import('./gpt/gpt').then(m => m.Gpt)
      }
    ]
  }
];