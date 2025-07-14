// server/src/resolver/event.resolvers.ts
import {Attendee, Event as EventType, events, getEventById, RSVPStatus, tags,} from '../data.js';
import {v4 as uuid} from 'uuid';
import {requireAuth, requireOwnership} from "../utils/requireAuth.js";
import {logger} from "../utils/logger.js";
import {MiniActivityContext} from "../types/context.js";
import {RemoveAttendeeArgs} from "../types/resolverInputs.js";
import {eventSchema} from '../middleware/validation/eventSchema.js';
import {validate} from '../middleware/validate.js';
import {z} from 'zod';
import {GraphQLResolveInfo} from 'graphql';

type CreateEventInput = z.infer<typeof eventSchema>;

export const eventResolvers = {
    Query: {
        events: () => {
            logger.info('[Query] Fetching all events');
            return events;
        },
        event: (_: unknown, {id}: { id: string }) => {
            logger.info(`[Query] Fetching event by id: ${id}`);
            let ev;
            ev = getEventById(id);
            logger.info(`Fetched event: ${ev}`);
            return ev
        },
    },

    Mutation: {
        createEvent: requireAuth(
            validate(eventSchema)(
                (
                    _: unknown,
                    { title, date, tagIds }: CreateEventInput,
                    context: MiniActivityContext,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    _info: GraphQLResolveInfo // 4th argument as per graphql standard
                ) => {
                    const { correlationId } = context;
                    logger.info(`[${correlationId}] [Event] Attempt create event: ${title}`);

                    const resolvedTags = tags.filter(tag => tagIds.includes(tag.id));
                    const newEvent: EventType = {
                        id: uuid(),
                        title,
                        date,
                        tags: resolvedTags,
                        attendees: [],
                        creatorId: context.userId!,
                        createdAt: new Date().toISOString(),
                    };
                    events.push(newEvent);
                    return newEvent;
                }
            )
        ),


        updateEvent: requireOwnership<null, {
            id: string;
            title?: string;
            date?: string;
            tagIds?: string[]
        }, MiniActivityContext, EventType>(
            // Ownership check
            ({id}) => {
                const event = getEventById(id);
                if (!event) throw new Error('Event not found');
                return event.creatorId!;
            },
            // Resolver body
            (_, {id, title, date, tagIds}, _context: MiniActivityContext) => {
                const {correlationId} = _context;
                logger.info(`[${correlationId}] [Event] Attempt update event: ${id}`);
                const event = getEventById(id);
                if (!event) throw new Error('Event not found');

                if (title !== undefined) event.title = title;
                if (date !== undefined) event.date = date;

                // Replace all tags with the newly selected ones
                if (tagIds !== undefined) {
                    event.tags = tags.filter(tag => tagIds.includes(tag.id));
                }

                return event;
            }
        ),

        deleteEvent: requireOwnership<null, { id: string }, MiniActivityContext, boolean>(
            // Ownership check
            ({id}) => {
                const event = getEventById(id);
                if (!event) throw new Error('Event not found');
                return event.creatorId!;
            },

            // Resolver body
            (_, {id}, _context: MiniActivityContext) => {
                const {correlationId} = _context;

                logger.info(`[${correlationId}] [Event] Attempt delete event: ${id}`);

                const index = events.findIndex(e => e.id === id);
                if (index === -1) throw new Error('Event not found');
                events.splice(index, 1);
                return true;
            }
        ),

        addAttendee: (
            _: unknown,
            {eventId, name, email}: { eventId: string; name: string; email?: string }
        ) => {
            logger.info(`[Mutation] Adding attendee "${name}" to event ${eventId}`);
            const event = getEventById(eventId);
            if (!event) throw new Error('Event not found');

            if (email && event.attendees.some(a => a.email === email)) {
                logger.warn('Attendee with same email already exists');
                return null;
            }

            const newAttendee: Attendee = {
                id: uuid(),
                name,
                email,
                rsvpStatus: RSVPStatus.GOING,
            };

            event.attendees.push(newAttendee);
            return newAttendee;
        },

        removeAttendee: requireOwnership<null, RemoveAttendeeArgs, MiniActivityContext, boolean>(
            // Ownership check
            ({eventId}) => {
                const event = getEventById(eventId);
                if (!event) throw new Error('Event not found');
                return event.creatorId!;
            },

            // Resolver body
            (_, {eventId, attendeeId}, _context: MiniActivityContext) => {
                const {correlationId} = _context;

                logger.info(`[${correlationId}] [Event] Attempt to remove attendee ${attendeeId} from event: ${eventId}`);

                logger.info(`[Mutation] Removing attendee ${attendeeId} from event ${eventId}`);

                const event = getEventById(eventId);
                if (!event) return false;

                const index = event.attendees.findIndex((a) => a.id === attendeeId);
                if (index === -1) return false;

                event.attendees.splice(index, 1);
                return true;
            }
        ),

    }
}