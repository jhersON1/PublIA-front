export interface User {
    _id: string;
    email: string;
    name: string;
    lastname: string;
    roles: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface LoginResponse extends User {
    token: string;
}

export interface CheckStatusResponse extends User {
    token: string;
}

export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
