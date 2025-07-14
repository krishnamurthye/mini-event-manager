// server/src/data.ts
import {v4 as uuid} from 'uuid';

export enum RSVPStatus {
    GOING = 'GOING',
    DECLINED = 'DECLINED',
    MAYBE = 'MAYBE',
}

export interface Attendee {
    id: string;
    name: string;
    email?: string;
    rsvpStatus: RSVPStatus;
}

export interface Event {
    id: string;
    title: string;
    date: string;
    tags: Tag[];
    attendees: Attendee[];
    creatorId?: string;
    createdAt: string;
}

export interface Person {
    id: string;
    name: string;
    email?: string;
    createdAt: string;
}

export interface User {
    id: string;
    personId: string;
    role?: string;
    createdAt: string;
}

export interface Credential {
    id: string;
    userId: string;
    provider: 'EMAIL';
    identifier: string; // email
    passwordHash?: string;
    createdAt: string;
}

export interface Tag {
    id: string;
    label: string;
}

export interface EventTag {
    eventId: string;
    tagId: string;
}

//  In-memory stores
export const events: Event[] = [];
export const persons: Person[] = [];
export const users: User[] = [];
export const credentials: Credential[] = [];

// Utility functions
export function getEventById(id: string): Event | undefined {
    console.log('[getEventById] Looking for event ID:', id);
    console.log('[getEventById] All events:', events.map(e => e.id));
    return events.find((event) => event.id === id);
}

export function createEvent(title: string, date: string): Event {
    const newEvent: Event = {
        id: uuid(),
        title,
        date,
        attendees: [],
        createdAt: new Date().toISOString(),
        tags: [],
    };
    events.push(newEvent);
    return newEvent;
}

export function addAttendee(eventId: string, name: string, email?: string): Attendee | null {
    const event = getEventById(eventId);
    if (!event) return null;

    const newAttendee: Attendee = {
        id: uuid(),
        name,
        email,
        rsvpStatus: RSVPStatus.GOING
    };
    event.attendees.push(newAttendee);
    return newAttendee;
}

export function removeAttendee(eventId: string, attendeeId: string): boolean {
    const event = getEventById(eventId);
    if (!event) return false;

    const prevLength = event.attendees.length;
    event.attendees = event.attendees.filter((a) => a.id !== attendeeId);
    return event.attendees.length < prevLength;
}

export const tags: Tag[] = [];

export function getTags(): Tag[] {
    return tags;
}

export function searchTags(query: string): Tag[] {
    return tags.filter(tag => tag.label.toLowerCase().includes(query.toLowerCase()));
}

export function createTag(label: string): Tag {
    const existing = tags.find(t => t.label.toLowerCase() === label.toLowerCase());
    if (existing) return existing;

    const newTag: Tag = {id: uuid(), label};
    tags.push(newTag);
    return newTag;
}
