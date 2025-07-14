// __tests__/GlobalAuthHandler.test.tsx
import {render} from '@testing-library/react';
import GlobalAuthHandler from '../GlobalAuthHandler';
import {toast} from 'react-hot-toast';

import {useErrorStore as useErrorStoreMocked} from 'mini-event/lib/store/errorStore';

// Mock Zustand store
jest.mock('mini-event/lib/store/errorStore', () => ({
    useErrorStore: jest.fn(),
}));

jest.mock('mini-event/lib/store/authStore', () => ({
    useAuthStore: {
        getState: () => ({
            logout: jest.fn(),
        }),
    },
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
    toast: {
        error: jest.fn(),
    },
}));

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));
type ErrorState = {
    authError: boolean;
    resetAuthError: () => void;
};

describe('<GlobalAuthHandler />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {
        });
        localStorage.setItem('token', 'dummy');

        (useErrorStoreMocked as unknown as jest.Mock).mockImplementation(
            (selector: (state: ErrorState) => unknown) => {
                return selector({
                    authError: true,
                    resetAuthError: jest.fn(),
                });
            }
        );

    });

    it('handles auth error by clearing token, showing toast, logging out, and redirecting', () => {
        render(<GlobalAuthHandler/>);

        expect(localStorage.getItem('token')).toBeNull();

        expect(toast.error).toHaveBeenCalledWith('Session has expired, Please log in again.');
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
});
