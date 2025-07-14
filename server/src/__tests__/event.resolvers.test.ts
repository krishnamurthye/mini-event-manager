import { eventResolvers } from '../resolvers/event.resolvers';
import { tags, events } from '../data';
import { v4 as uuid } from 'uuid';
import { MiniActivityContext } from '../types/context';
import {GraphQLResolveInfo} from "graphql";

const mockUserId = 'user-1';
const mockContextData = {
    userId: mockUserId,
    correlationId: 'test-correlation-id',
};

const context: MiniActivityContext = mockContextData;


// Helper: reset in-memory DB
beforeEach(() => {
    events.length = 0;
    tags.length = 0;

    // Add sample tags
    tags.push({ id: uuid(), label: 'Workshop' });
    tags.push({ id: uuid(), label: 'Tech' });



});

describe('Event Resolvers', () => {
    describe('createEvent', () => {
        it('creates a new event with valid input', async () => {
            const input = {
                title: 'Test Event',
                date: new Date().toISOString(),
                tagIds: tags.map(t => t.id),
            };

            const result = await eventResolvers.Mutation.createEvent(
                null,
                input,
                context,
                {} as GraphQLResolveInfo
            );

            expect(result.title).toBe('Test Event');
            expect(result.creatorId).toBe(mockUserId);
            expect(result.tags.length).toBe(tags.length);
            expect(events.length).toBe(1);
        });

        it('fails on missing title', async () => {
            await expect(eventResolvers.Mutation.createEvent(
                null,
                { title: '', date: new Date().toISOString(), tagIds: [] },
                context,
                {} as any
            )).rejects.toThrow('Title is required');
        });
    });

    // describe('updateEvent', () => {
    //     it('updates an event you own', async () => {
    //         const event = {
    //             id: uuid(),
    //             title: 'Old Title',
    //             date: new Date().toISOString(),
    //             tags: [],
    //             attendees: [],
    //             creatorId: mockUserId,
    //             createdAt: new Date().toISOString(),
    //         };
    //         events.push(event);
    //
    //         const result = await eventResolvers.Mutation.updateEvent(
    //             null,
    //             { id: event.id, title: 'New Title' },
    //             context
    //         );
    //
    //         expect(result.title).toBe('New Title');
    //     });
    //
    //     it('fails to update if you are not the owner', async () => {
    //         const event = {
    //             id: uuid(),
    //             title: 'Old Title',
    //             date: new Date().toISOString(),
    //             tags: [],
    //             attendees: [],
    //             creatorId: 'other-user',
    //             createdAt: new Date().toISOString(),
    //         };
    //         events.push(event);
    //
    //         await expect(eventResolvers.Mutation.updateEvent(
    //             null,
    //             { id: event.id, title: 'New Title' },
    //             context,
    //             {} as any
    //         )).rejects.toThrow('Unauthorized');
    //     });
    // });
    //
    // describe('addAttendee', () => {
    //     it('adds a new attendee to an event', () => {
    //         const event = {
    //             id: uuid(),
    //             title: 'Event with Attendees',
    //             date: new Date().toISOString(),
    //             tags: [],
    //             attendees: [],
    //             creatorId: mockUserId,
    //             createdAt: new Date().toISOString(),
    //         };
    //         events.push(event);
    //
    //         const attendee = eventResolvers.Mutation.addAttendee(
    //             null,
    //             { eventId: event.id, name: 'Krish', email: 'krish@example.com' }
    //         );
    //
    //         expect(attendee).toHaveProperty('id');
    //         expect(events[0].attendees.length).toBe(1);
    //     });
    //
    //     it('returns null for duplicate email', () => {
    //         const event = {
    //             id: uuid(),
    //             title: 'Event with Attendees',
    //             date: new Date().toISOString(),
    //             tags: [],
    //             attendees: [{
    //                 id: uuid(),
    //                 name: 'Krish',
    //                 email: 'krish@example.com',
    //                 rsvpStatus: 'YES'
    //             }],
    //             creatorId: mockUserId,
    //             createdAt: new Date().toISOString(),
    //         };
    //         events.push(event);
    //
    //         const result = eventResolvers.Mutation.addAttendee(
    //             null,
    //             { eventId: event.id, name: 'Someone', email: 'krish@example.com' }
    //         );
    //
    //         expect(result).toBeNull();
    //     });
    // });
    //
    // describe('removeAttendee', () => {
    //     it('removes an attendee by ID', async () => {
    //         const attendeeId = uuid();
    //         const event = {
    //             id: uuid(),
    //             title: 'Event',
    //             date: new Date().toISOString(),
    //             tags: [],
    //             attendees: [{ id: attendeeId, name: 'A', rsvpStatus: 'YES' }],
    //             creatorId: mockUserId,
    //             createdAt: new Date().toISOString(),
    //         };
    //         events.push(event);
    //
    //         const result = await eventResolvers.Mutation.removeAttendee(
    //             null,
    //             { eventId: event.id, attendeeId },
    //             context
    //         );
    //
    //         expect(result).toBe(true);
    //         expect(event.attendees.length).toBe(0);
    //     });
    // });
});
