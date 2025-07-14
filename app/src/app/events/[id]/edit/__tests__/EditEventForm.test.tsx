'use client';

import {fireEvent, screen, waitFor} from '@testing-library/react';
import {useRouter} from 'next/navigation';
import {renderWithApollo} from 'mini-event/lib/apollo/test-utils';
import EditEventForm from "mini-event/app/events/[id]/edit/EditEventForm";
import {useSafeMutation} from "mini-event/lib/hooks/useSafeMutation";
import {UPDATE_EVENT} from "mini-event/graphql/event/mutations";
import EditEventPageWrapper from "mini-event/app/events/[id]/edit/page";
import {GET_EVENT_BY_ID} from "mini-event/graphql/event/queries";
import {useAuthStore} from "mini-event/lib/store/authStore";
import {toast} from "react-hot-toast";

jest.mock('mini-event/lib/hooks/useSafeMutation');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(() => ({id: 'event-123'})),
}));
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));
jest.mock('mini-event/lib/store/authStore', () => ({
    useAuthStore: jest.fn(),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockUpdateEvent = jest.fn();

const baseEvent = {
    id: 'event-123',
    title: 'Sample Title',
    date: '2099-12-31',
    creatorId: 'user-123',
    tags: [],
    attendees: [],
    __typename: 'Event',
};

beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({push: mockPush, replace: mockReplace});
    (useSafeMutation as jest.Mock).mockReturnValue([mockUpdateEvent, {loading: false}]);
    jest.spyOn(console, 'error').mockImplementation(() => {
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('<EditEventPageWrapper />', () => {
    it('renders EditEventForm with initial values', () => {
        renderWithApollo(
            <EditEventForm event={{...baseEvent, tags: [{id: 'tag-1', label: 'React'}]}}/>
        );
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Sample Title')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2099-12-31')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Update Event/i})).toBeInTheDocument();
    });

    it('updates the event and navigates on success', async () => {
        const mocks = [
            {
                request: {
                    query: UPDATE_EVENT,
                    variables: {
                        id: 'event-123',
                        title: 'Changing Event Title',
                        date: '2099-12-31',
                        tagIds: [],
                    },
                },
                result: {
                    data: {
                        updateEvent: {
                            id: 'event-123',
                            title: 'Changing Event Title',
                            date: '2099-12-31',
                            tags: [],
                        },
                    },
                },
            },
        ];

        renderWithApollo(<EditEventForm event={baseEvent}/>, mocks);

        fireEvent.change(screen.getByLabelText(/Title/i), {
            target: {value: 'Changing Event Title'},
        });

        fireEvent.click(screen.getByRole('button', {name: /Update Event/i}));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/events/event-123');
        });
    });

    it('redirects if user is not the creator', async () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({loggedIn: true, userId: 'hacker'})
        );

        const mocks = [
            {
                request: {
                    query: GET_EVENT_BY_ID,
                    variables: {id: 'event-123'},
                },
                result: {data: {event: baseEvent}},
            },
        ];

        renderWithApollo(<EditEventPageWrapper/>, mocks);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('You are not authorized to edit this event.');
            expect(mockReplace).toHaveBeenCalledWith('/events');
        });
    });

    it('shows loading state during query', async () => {
        const loadingMocks = [
            {
                request: {
                    query: GET_EVENT_BY_ID,
                    variables: {id: 'event-123'},
                },
                delay: 999999, // simulate slow response
                result: {
                    data: {event: baseEvent},
                },
            },
        ];

        renderWithApollo(<EditEventPageWrapper/>, loadingMocks);

        expect(await screen.findByText(/Loading.../i)).toBeInTheDocument();
    });

    it('shows error toast and redirects if query fails', async () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({loggedIn: true, userId: 'user-123'})
        );

        const errorMocks = [
            {
                request: {
                    query: GET_EVENT_BY_ID,
                    variables: {id: 'event-123'},
                },
                error: new Error('Network error'),
            },
        ];

        renderWithApollo(<EditEventPageWrapper/>, errorMocks);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to load event.');
            expect(mockReplace).toHaveBeenCalledWith('/events');
        });
    });
});
