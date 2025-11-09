import { Routes } from '@angular/router';

export const featureRoutes: Routes = [
  {
    path: '',
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