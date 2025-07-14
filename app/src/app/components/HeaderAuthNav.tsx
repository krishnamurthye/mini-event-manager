// app/components/HeaderAuthNav.tsx
'use client';

import Link from 'next/link';
import {useAuthStore} from 'mini-event/lib/store/authStore';
import {useEffect, useState} from 'react';

export default function AuthNav() {
    const loggedIn = useAuthStore((s) => s.loggedIn);
    const logout = useAuthStore((s) => s.logout);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Only render after hydration to prevent mismatch
    if (!mounted) return null;

    return (
        <nav className="flex items-center space-x-4">
            {!loggedIn ? (
                <>
                    <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
                    <Link href="/auth/register" className="text-blue-600 hover:underline">Sign Up</Link>
                </>
            ) : (
                <>
                    <Link href="/events/new" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+
                        New Event</Link>
                    <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
                </>
            )}
        </nav>
    );
}
