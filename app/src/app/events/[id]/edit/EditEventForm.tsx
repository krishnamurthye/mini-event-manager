'use client';

import {useRouter} from 'next/navigation';
import {useMutation} from '@apollo/client';
import {UPDATE_EVENT} from 'mini-event/graphql/event/mutations';
import {toast} from 'react-hot-toast';
import EventForm from '../../../components/EventForm';
import {EventModel} from 'mini-event/types';

export default function EditEventForm({event}: { event: EventModel }) {
    const router = useRouter();
    const [updateEvent, {loading}] = useMutation(UPDATE_EVENT);

    return (
        <EventForm
            mode="edit"
            loading={loading}
            initialValues={{
                title: event.title,
                date: event.date.split('T')[0],
                tagIds: event.tags.map((t) => t.id),
            }}
            initialTags={event.tags}
            onSubmit={async (values) => {
                try {
                    await updateEvent({variables: {id: event.id, ...values}});
                    toast.success('Event updated successfully.');
                    router.push(`/events/${event.id}`);
                } catch (err) {
                    toast.error('Failed to update event');
                    console.error('Update error:', err);
                }
            }}
        />
    );
}

