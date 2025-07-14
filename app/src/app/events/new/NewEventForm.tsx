'use client';

import {CREATE_EVENT} from 'mini-event/graphql/event/mutations';
import {useSafeMutation} from 'mini-event/lib/hooks/useSafeMutation';
import {useRouter} from 'next/navigation';
import {toast} from 'react-hot-toast';
import EventForm from '../../components/EventForm';

export default function NewEventForm() {
    const [createEvent, {loading}] = useSafeMutation(CREATE_EVENT);
    const router = useRouter();

    return (
        <EventForm
            mode="create"
            loading={loading}
            initialValues={{title: '', date: '', tagIds: []}}
            onSubmit={async (values) => {
                await createEvent({variables: values});
                toast.success('Event created successfully.');
                router.push('/events');
            }}
        />
    );
}
