import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export function useRequireAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/auth/login');
        } else {
            setLoading(false);
        }
    }, [router]);

    return {loading};
}

