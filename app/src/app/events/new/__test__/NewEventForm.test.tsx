'use client';

import {fireEvent, screen, waitFor} from '@testing-library/react';
import NewEventForm from '../NewEventForm';
import {useSafeMutation} from 'mini-event/lib/hooks/useSafeMutation';
import {renderWithApollo} from 'mini-event/lib/apollo/test-utils';
import {useRouter} from 'next/navigation';
import {toast} from 'react-hot-toast';

// Mocks
jest.mock('mini-event/lib/hooks/useSafeMutation');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
    },
}));

describe('<NewEventForm />', () => {
    const mockPush = jest.fn();
    const mockCreateEvent = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({push: mockPush});
        (useSafeMutation as jest.Mock).mockReturnValue([mockCreateEvent, {loading: false}]);
    });


    it('renders form fields', () => {
        renderWithApollo(<NewEventForm/>);
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Create Event/i})).toBeInTheDocument();
    });

    it('shows validation errors for required fields', async () => {
        renderWithApollo(<NewEventForm/>);
        fireEvent.click(screen.getByRole('button', {name: /Create Event/i}));

        await waitFor(() => {
            expect(screen.getByText('Title is required')).toBeInTheDocument();
            expect(screen.getByText('Date is required')).toBeInTheDocument();
        });
    });

    it('submits the form and navigates on success', async () => {
        mockCreateEvent.mockResolvedValueOnce({});
        renderWithApollo(<NewEventForm/>);

        fireEvent.change(screen.getByLabelText(/Title/i), {
            target: {value: 'Test Event'},
        });
        fireEvent.change(screen.getByLabelText(/Date/i), {
            target: {value: '2099-12-31'},
        });

        fireEvent.click(screen.getByRole('button', {name: /Create Event/i}));

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledWith({
                variables: {
                    title: 'Test Event',
                    date: '2099-12-31',
                    tagIds: [],
                },
            });
            expect(toast.success).toHaveBeenCalledWith('Event created successfully.');
            expect(mockPush).toHaveBeenCalledWith('/events');
        });
    });
});
