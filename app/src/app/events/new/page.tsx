// app/events/new/page.tsx
'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from 'mini-event/lib/store/authStore';
import NewEventForm from './NewEventForm';

export default function NewEventPage() {
    const router = useRouter();
    const isLoggedIn = useAuthStore((s) => s.loggedIn);

    useEffect(() => {
        if (!isLoggedIn) {
            router.replace('/auth/login'); // redirect if not logged in
        }
    }, [isLoggedIn, router]);

    if (!isLoggedIn) return null;

    return <NewEventForm/>;
}
