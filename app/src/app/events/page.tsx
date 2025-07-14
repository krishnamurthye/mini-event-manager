'use client';

import {gql, useQuery} from '@apollo/client';
import Link from 'next/link';
import {EventModel} from "mini-event/types";

const GET_EVENTS = gql`
    query GetEvents {
        events {
            id
            title
            date
            attendees {
                id
            }
        }
    }
`;

export default function EventsPage() {
    const {data, loading, error} = useQuery<{ events: EventModel[] }>(GET_EVENTS, {
        fetchPolicy: 'network-only',
    });

    if (loading) return <p className="p-4">Loading events...</p>;
    if (error) return <p className="p-4 text-red-500">Error loading events</p>;

    const events = data?.events || [];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Events</h1>
            </div>

            {events.length === 0 ? (
                <div className="text-center text-gray-600 mt-10">
                    <p className="text-lg mb-4">No events found.</p>
                    <Link
                        href="/events/new"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create your first event
                    </Link>
                </div>
            ) : (
                <ul className="space-y-4">
                    {events.map((event: EventModel) => (
                        <li key={event.id} className="border rounded p-4 shadow-sm">
                            <Link href={`/events/${event.id}`}>
                                <h2 className="text-xl font-semibold hover:underline">
                                    {event.title}
                                </h2>
                            </Link>
                            <p className="text-gray-500">
                                {new Date(event.date).toDateString()}
                            </p>
                            <p className="text-sm text-gray-700">
                                {event.attendees.length} attendee(s)
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
