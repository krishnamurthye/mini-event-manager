'use client';

import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import EventDetailPage from '../page';
import {useMutation, useQuery} from '@apollo/client';
import {useParams, useRouter} from 'next/navigation';
import {useAuthStore} from 'mini-event/lib/store/authStore';
import {toast} from 'react-hot-toast';

// Mocks
jest.mock('@apollo/client');
jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
    useRouter: jest.fn(),
}));
jest.mock('mini-event/lib/store/authStore', () => ({
    useAuthStore: jest.fn(),
}));
jest.mock('mini-event/lib/useAuth', () => ({
    useRequireAuth: () => ({loading: false}),
}));
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('<EventDetailPage />', () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useParams as jest.Mock).mockReturnValue({id: 'event-123'});
        (useRouter as jest.Mock).mockReturnValue({push: mockPush});
        (useAuthStore as unknown as jest.Mock).mockImplementation((selectorFn) =>
            selectorFn({loggedIn: true, userId: 'user-123'})
        );

        (useQuery as jest.Mock).mockReturnValue({
            loading: false,
            error: null,
            refetch: mockRefetch,
            data: {
                event: {
                    id: 'event-123',
                    title: 'Test Event',
                    date: '2099-12-31T00:00:00Z',
                    creatorId: 'user-123',
                    attendees: [
                        {id: 'att-1', name: 'John Doe', email: 'john@example.com'},
                    ],
                    tags: [{id: 'tag-1', label: 'workshop'}],
                },
            },
        });

        (useMutation as jest.Mock).mockImplementation(() => [jest.fn()]);
    });

    it('renders event details correctly', async () => {
        render(<EventDetailPage/>);

        expect(await screen.findByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('Thu Dec 31 2099')).toBeInTheDocument();
        expect(screen.getByText('#workshop')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows edit and delete buttons if user is creator', async () => {
        render(<EventDetailPage/>);
        expect(await screen.findByText(/Edit/i)).toBeInTheDocument();
        expect(screen.getByText(/Delete/i)).toBeInTheDocument();
    });

    it('navigates to edit page when Edit is clicked', async () => {
        render(<EventDetailPage/>);
        fireEvent.click(await screen.findByText(/Edit/i));
        expect(mockPush).toHaveBeenCalledWith('/events/event-123/edit');
    });

    it('deletes the event on confirmation', async () => {
        const deleteMock = jest.fn().mockResolvedValue({});
        (useMutation as jest.Mock).mockImplementationOnce(() => [deleteMock]);

        window.confirm = jest.fn(() => true); // simulate user confirming delete

        render(<EventDetailPage/>);
        fireEvent.click(screen.getByText(/Delete/i));

        await waitFor(() => {
            expect(deleteMock).toHaveBeenCalledWith({variables: {id: 'event-123'}});
            expect(toast.success).toHaveBeenCalledWith('Event deleted');
            expect(mockPush).toHaveBeenCalledWith('/events');
        });
    });

    it('shows loading and error states', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({loading: true});
        render(<EventDetailPage/>);
        expect(screen.getByText(/Loading event.../i)).toBeInTheDocument();

        (useQuery as jest.Mock).mockReturnValueOnce({loading: false, error: true});
        render(<EventDetailPage/>);
        expect(screen.getByText(/Event not found/i)).toBeInTheDocument();
    });
});
