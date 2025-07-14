// app/src/types/index.ts

export type RSVPStatus = 'YES' | 'NO' | 'MAYBE';

export interface Attendee {
    id: string;
    name: string;
    email?: string;
    rsvpStatus: RSVPStatus;
}

export interface EventModel {
    id: string;
    title: string;
    date: string;
    tags: Tag[];
    creatorId: string;
    attendees: Attendee[];
}

export interface Tag {
    id: string;
    label: string;
}
