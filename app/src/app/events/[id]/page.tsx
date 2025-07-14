// app/events/[id]/page.tsx:
'use client';

import {useParams, useRouter} from 'next/navigation';
import {useMutation, useQuery} from '@apollo/client';
import {ADD_ATTENDEE, DELETE_EVENT, REMOVE_ATTENDEE} from 'mini-event/graphql/event/mutations';
import {GET_EVENT_BY_ID} from 'mini-event/graphql/event/queries';
import {ErrorMessage, Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import {useAuthStore} from 'mini-event/lib/store/authStore';
import {toast} from 'react-hot-toast';
import {Attendee, Tag} from "mini-event/types";


export default function EventDetailPage() {
    const router = useRouter();
    const param = useParams();
    const id = Array.isArray(param.id) ? param.id[0] : param.id;
    // console.log("Event page param id:", id);

    const {data, loading, error, refetch} = useQuery(GET_EVENT_BY_ID, {
        variables: {id},
    });
    const loggedIn = useAuthStore((s) => s.loggedIn);
    const userId = useAuthStore((s) => s.userId);

    const [deleteEvent] = useMutation(DELETE_EVENT);
    const [addAttendee] = useMutation(ADD_ATTENDEE);
    const [removeAttendee] = useMutation(REMOVE_ATTENDEE);

    // if (authLoading) return <p className="p-4">Checking authentication...</p>;
    if (loading) return <p className="p-4">Loading event...</p>;
    if (error || !data?.event) return <p className="p-4 text-red-500">Event not found</p>;

    const event = data.event;
    const isCreator = userId === event.creatorId;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-gray-500">{new Date(event.date).toDateString()}</p>
                {/* Display tags here */}
                <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-2">
                    {event.tags.map((tag: Tag) => (
                        <span
                            key={tag.id}
                            className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs"
                        >
          #{tag.label}
        </span>
                    ))}
                </div>
            </div>

            {isCreator && (
                <div className="mt-2 flex gap-4">
                    <button
                        onClick={() => router.push(`/events/${event.id}/edit`)}
                        className="text-blue-600 text-sm hover:underline"
                    >
                        Edit
                    </button>
                    <button
                        onClick={async () => {
                            if (confirm("Are you sure you want to delete this event?")) {
                                try {
                                    await deleteEvent({variables: {id: event.id}});
                                    toast.success("Event deleted");
                                    router.push("/events");
                                } catch (err) {
                                    toast.error("Failed to delete event");
                                    console.error("Delete error:", err);
                                }
                            }
                        }}
                        className="text-red-600 text-sm hover:underline"
                    >
                        Delete
                    </button>
                </div>
            )}


            <div>
                <h2 className="text-xl font-semibold mb-2">Attendees</h2>
                {event.attendees.length === 0 ? (
                    <p className="text-sm text-gray-600">No attendees yet</p>
                ) : (
                    <ul className="space-y-2">
                        {event.attendees.map((att: Attendee) => (
                            <li key={att.id} className="flex justify-between items-center border px-3 py-2 rounded">
                                <div>
                                    <p className="font-medium">{att.name}</p>
                                    {att.email && <p className="text-sm text-gray-500">{att.email}</p>}
                                </div>
                                {isCreator && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await removeAttendee({
                                                    variables: {eventId: event.id, attendeeId: att.id},
                                                });
                                                toast.success("Successfully removed attendees!");
                                                refetch();
                                            } catch (err) {
                                                toast.error("Failed to remove attendee");
                                                console.error('Failed to remove attendee:', err);
                                            }
                                        }}
                                        className="text-red-500 hover:underline text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {!loggedIn && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Add Attendee</h2>
                    <Formik
                        initialValues={{name: '', email: ''}}
                        validationSchema={Yup.object({
                            name: Yup.string().required('Name is required'),
                            email: Yup.string()
                                .email('Invalid email')
                                .required('Email is required'),
                        })}
                        onSubmit={async (values, {resetForm}) => {
                            try {
                                await addAttendee({
                                    variables: {
                                        eventId: event.id,
                                        name: values.name,
                                        email: values.email, // no need for `|| undefined` now
                                    },
                                });
                                toast.success("Attended added successfully.")
                                resetForm();
                                refetch();
                            } catch (err) {
                                toast.error("Failed to add Attended")
                                console.error('Failed to add attendee:', err);
                            }
                        }}
                    >
                        {({isSubmitting}) => (
                            <Form className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium">Name</label>
                                    <Field name="name" className="w-full border px-2 py-1 rounded"/>
                                    <ErrorMessage name="name" className="text-red-500 text-sm" component="p"/>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">Email</label>
                                    <Field name="email" type="email" className="w-full border px-2 py-1 rounded"/>
                                    <ErrorMessage name="email" className="text-red-500 text-sm" component="p"/>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Add Attendee
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}
        </div>
    );
}
