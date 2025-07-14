import Link from "next/link";
import {EventModel} from "mini-event/types";

export default function EventCard({event}: { event: EventModel }) {
    return (
        <div className="border p-4 rounded shadow-sm">
            <Link href={`/events/${event.id}`}>
                <h2 className="text-xl font-semibold hover:underline">{event.title}</h2>
            </Link>
            <p className="text-gray-500">{new Date(event.date).toDateString()}</p>
            <p className="text-sm text-gray-700">{event.attendees.length} attendee(s)</p>
        </div>
    );
}
