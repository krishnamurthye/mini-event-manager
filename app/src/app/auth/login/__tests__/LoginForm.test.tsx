// src/app/auth/login/__tests__/LoginForm.test.tsx
import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MockedProvider} from '@apollo/client/testing';
import LoginForm from '../LoginForm';
import {LOGIN_USER} from 'mini-event/graphql/auth/mutations';
import {useAuthStore} from 'mini-event/lib/store/authStore';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('LoginForm', () => {
    const mockToken = 'test-token';
    const mockUserId = 'test-user-id';

    const mocks = [
        {
            request: {
                query: LOGIN_USER,
                variables: {
                    email: 'test@example.com',
                    password: 'password123',
                },
            },
            result: {
                data: {
                    loginUser: {
                        token: mockToken,
                        user: {
                            id: mockUserId,
                            personId: 'mock-person-id',
                            __typename: 'User',
                        },
                        __typename: 'LoginResponse',
                    },
                },
            },
        },
    ];

    beforeEach(() => {
        // Reset Zustand store before each test
        useAuthStore.setState({loggedIn: false, userId: ''});
        localStorage.clear();
    });

    it('logs in user and stores token', async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={true}>
                <LoginForm/>
            </MockedProvider>
        );

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: {value: 'test@example.com'},
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: {value: 'password123'},
        });

        fireEvent.click(screen.getByRole('button', {name: /login/i}));

        await waitFor(() => {
            expect(useAuthStore.getState().loggedIn).toBe(true);
            expect(useAuthStore.getState().userId).toBe(mockUserId);
        });
    });
});
