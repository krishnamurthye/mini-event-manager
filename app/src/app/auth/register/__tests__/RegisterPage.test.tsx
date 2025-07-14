'use client';

import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import RegisterPage from 'mini-event/app/auth/register/page';
import {MockedProvider} from '@apollo/client/testing';
import {REGISTER_USER} from 'mini-event/graphql/user/mutations';
import {toast} from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import { MockedResponse } from '@apollo/client/testing';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('<RegisterPage />', () => {
    const mockPush = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({push: mockPush});
    });

    const renderPage = (mocks: MockedResponse[] = []) =>
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <RegisterPage/>
            </MockedProvider>
        );

    const fillAndSubmitForm = (mocks:  MockedResponse[]  = []) => {
        renderPage(mocks);
        fireEvent.change(screen.getByLabelText(/name/i), {
            target: {value: 'Test User'},
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: {value: 'test@example.com'},
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: {value: 'test1234'},
        });

        fireEvent.click(screen.getByRole('button', {name: /register/i}));
    };

    it('renders form fields correctly', () => {
        renderPage();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /register/i})).toBeInTheDocument();
    });

    it('shows validation errors on submit with empty fields', async () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', {name: /register/i}));
        expect(await screen.findAllByText('Required')).toHaveLength(3);
    });

    it('registers user and redirects on success', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: REGISTER_USER,
                    variables: {
                        name: 'Test User',
                        email: 'test@example.com',
                        password: 'test1234',
                    },
                },
                result: {
                    data: {
                        registerUser: {
                            id: 'user-1',
                            personId: 'person-1',
                            createdAt: new Date().toISOString(),
                        },
                    },
                },
            },
        ];

        fillAndSubmitForm(mocks);
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Registration successful!');
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });
    });

    it('shows error on mutation failure', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: REGISTER_USER,
                    variables: {
                        name: 'Test User',
                        email: 'test@example.com',
                        password: 'test1234',
                    },
                },
                error: new Error('User already exists'),
            },
        ];

        fillAndSubmitForm(mocks);
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('User already exists');
            expect(mockPush).not.toHaveBeenCalled();
        });
    });
});
