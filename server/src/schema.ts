// server/src/schema.ts
import {gql} from 'apollo-server';

export const typeDefs = gql`
    type Attendee {
        id: ID!
        name: String!
        email: String
        rsvpStatus: RSVPStatus!
    }

    type Tag {
        id: ID!
        label: String!
    }

    type Event {
        id: ID!
        title: String!
        date: String!  #    start time 
        tags: [Tag!]!
        attendees: [Attendee!]!
        creatorId: ID
        endTime: String!  # end time
    }

    type User {
        id: ID!
        personId: ID!
        createdAt: String!
    }

    type AuthPayload {
        user: User!
        token: String!
    }

    type Query {
        events: [Event!]!
        event(id: ID!): Event
        tags: [Tag!]!
        searchTags(query: String!): [Tag!]!
    }

    enum RSVPStatus {
        GOING
        MAYBE
        DECLINED
    }

    type Mutation {
        createEvent(title: String!, date: String!, tagIds: [String!]): Event!
        updateEvent(id: ID!, title: String, date: String, tagIds: [String!]): Event!
        deleteEvent(id: ID!): Boolean!
        addAttendee(eventId: ID!, name: String!, email: String): Attendee!
        removeAttendee(eventId: ID!, attendeeId: ID!): Boolean!

        registerUser(name: String!, email: String!, password: String!): User!
        loginUser(email: String!, password: String!): AuthPayload!

        createTag(label: String!): Tag!
        assignTagToEvent(eventId: ID!, tagId: ID!): Boolean!
    }
`;
