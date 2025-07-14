// lib/store/authStore.ts

import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface AuthState {
    loggedIn: boolean;
    userId: string;
    login: (token: string, userId: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            loggedIn: false,
            userId: '',
            login: (token, userId) => {
                localStorage.setItem('token', token);
                set({loggedIn: true, userId});
            },
            logout: () => {
                localStorage.removeItem('token');
                set({loggedIn: false, userId: ''});
            },
        }),
        {
            name: 'auth-store', // storage key in localStorage
        }
    )
);
