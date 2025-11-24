import { Routes } from '@angular/router';
import { AuthLayout } from './layout/auth-layout';


export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                loadComponent: () => import('./pages/login/login').then(m => m.Login)
            },
            {
                path: 'register',
                loadComponent: () => import('./pages/register/register').then(m => m.Register)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    }
];
