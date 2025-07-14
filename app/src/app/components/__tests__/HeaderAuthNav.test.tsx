// app/components/__tests__/HeaderAuthNav.test.tsx
import {render, screen} from '@testing-library/react';
import AuthNav from '../HeaderAuthNav';
import {useAuthStore} from 'mini-event/lib/store/authStore';

jest.mock('mini-event/lib/store/authStore', () => ({
    useAuthStore: jest.fn(),
}));

describe('AuthNav', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows login/signup when not logged in', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selectorFn) =>
            selectorFn({loggedIn: false, logout: jest.fn()})
        );


        render(<AuthNav/>);
        expect(screen.getByText(/Login/i)).toBeInTheDocument();
        expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    });

    it('shows logout and new event when logged in', () => {

        (useAuthStore as unknown as jest.Mock).mockImplementation((selectorFn) =>
            selectorFn({loggedIn: true, logout: jest.fn()})
        );

        render(<AuthNav/>);
        expect(screen.getByText(/logout/i)).toBeInTheDocument();

    });
});