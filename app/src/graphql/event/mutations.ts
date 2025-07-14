//  src/graphql/mutation.ts
import {gql} from '@apollo/client';

export const CREATE_EVENT = gql`
    mutation CreateEvent($title: String!, $date: String!, $tagIds: [String!]!) {
        createEvent(title: $title, date: $date, tagIds: $tagIds) {
            id
            title
            date
            tags {
                id
                label
            }
        }
    }
`;

export const UPDATE_EVENT = gql`
    mutation UpdateEvent($id: ID!, $title: String!, $date: String!, $tagIds: [String!]!) {
        updateEvent(id: $id, title: $title, date: $date, tagIds: $tagIds) {
            id
            title
            date
            tags {
                id
                label
            }
        }
    }
`;

export const DELETE_EVENT = gql`
    mutation DeleteEvent($id: ID!) {
        deleteEvent(id: $id)
    }
`;

export const CREATE_TAG = gql`
    mutation CreateTag($label: String!) {
        createTag(label: $label) {
            id
            label
        }
    }
`;

export const ADD_ATTENDEE = gql`
    mutation AddAttendee($eventId: ID!, $name: String!, $email: String) {
        addAttendee(eventId: $eventId, name: $name, email: $email) {
            id
            name
        }
    }
`;

export const REMOVE_ATTENDEE = gql`
    mutation RemoveAttendee($eventId: ID!, $attendeeId: ID!) {
        removeAttendee(eventId: $eventId, attendeeId: $attendeeId)
    }
`;