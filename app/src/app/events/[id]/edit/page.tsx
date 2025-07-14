'use client';

import {useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {useQuery} from '@apollo/client';
import {GET_EVENT_BY_ID} from 'mini-event/graphql/event/queries';
import {useAuthStore} from 'mini-event/lib/store/authStore';
import EditEventForm from './EditEventForm';
import {toast} from 'react-hot-toast';


export default function EditEventPageWrapper() {
    const router = useRouter();
    const params = useParams();
    const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

    const userId = useAuthStore((s) => s.userId);
    const isLoggedIn = useAuthStore((s) => s.loggedIn);

    const {data, loading, error} = useQuery(GET_EVENT_BY_ID, {
        variables: {id: eventId},
    });

    const event = data?.event;
    const isAuthorized = isLoggedIn && event?.creatorId === userId;

    useEffect(() => {
        if (error) {
            toast.error('Failed to load event.');
            router.replace('/events');
        } else if (!loading && event && !isAuthorized) {
            toast.error('You are not authorized to edit this event.');
            router.replace('/events');
        }
    }, [error, loading, event, isAuthorized, router]);

    if (loading) return <p className="p-4">Loading...</p>;

    if (!event || !isAuthorized) return null;

    console.log('event:', event, 'userId:', userId, 'isLoggedIn:', isLoggedIn, 'isAuthorized:', isAuthorized);

    return <EditEventForm event={event}/>;
}

