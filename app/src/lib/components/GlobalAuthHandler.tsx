// lib/components/GlobalAuthHandler.tsx
'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useErrorStore} from 'mini-event/lib/store/errorStore';
import {toast} from 'react-hot-toast';
import {useAuthStore} from "mini-event/lib/store/authStore";

export default function GlobalAuthHandler() {
    const router = useRouter();
    const authError = useErrorStore((s) => s.authError);
    const resetAuthError = useErrorStore((s) => s.resetAuthError);

    useEffect(() => {
        if (authError) {
            console.error("Session has expired. Please log in again", authError);
            resetAuthError();
            handleAuthError()
            router.push('/auth/login');
        }
    }, [authError, resetAuthError, router]);

    return null;
}

export function handleAuthError() {
    localStorage.removeItem('token');
    useAuthStore.getState().logout();
    toast.error('Session has expired, Please log in again.');
    if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
    }
}
