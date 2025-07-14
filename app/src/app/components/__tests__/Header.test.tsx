// app/components/__tests__/Header.test.tsx
import {render, screen} from '@testing-library/react';
import Header from '../Header';
import {useAuthStore} from 'mini-event/lib/store/authStore';

jest.mock('mini-event/lib/store/authStore', () => ({
    useAuthStore: jest.fn(),
}));

describe('Header component', () => {
    it('shows Login and Sign Up when not logged in', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((fn) =>
            fn({loggedIn: false, logout: jest.fn()})
        );

        render(<Header/>);

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('shows Logout and New Event when logged in', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((fn) =>
            fn({loggedIn: true, logout: jest.fn()})
        );

        render(<Header/>);
        expect(screen.getByText('+ New Event')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });
});
