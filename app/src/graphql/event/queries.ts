import {gql} from '@apollo/client';

export const GET_EVENTS = gql`
    query GetEvents {
        events {
            id
            title
            date
            creatorId
            attendees {
                id
            }
        }
    }
`;

export const GET_EVENT_BY_ID = gql`
    query GetEvent($id: ID!) {
        event(id: $id) {
            id
            title
            date
            creatorId
            attendees {
                id
                name
                email
                rsvpStatus
            }
            tags {
                id
                label
            }
        }
    }
`;


export const GET_TAGS = gql`
    query GetTags {
        tags {
            id
            label
        }
    }
`;

export const SEARCH_TAGS = gql`
    query SearchTags($query: String!) {
        searchTags(query: $query) {
            id
            label
        }
    }
`;