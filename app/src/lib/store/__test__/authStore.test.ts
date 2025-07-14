import {useAuthStore} from '../authStore';

describe('useAuthStore', () => {
    beforeEach(() => {
        // Clear store state before each test
        useAuthStore.setState({
            loggedIn: false,
            userId: '',
        });

        // Clean up localStorage
        localStorage.clear();
    });

    it('has initial state', () => {
        const state = useAuthStore.getState();
        expect(state.loggedIn).toBe(false);
        expect(state.userId).toBe('');
    });

    it('logs in the user', () => {
        const token = 'abc123';
        const userId = 'user-001';

        useAuthStore.getState().login(token, userId);

        const state = useAuthStore.getState();
        expect(state.loggedIn).toBe(true);
        expect(state.userId).toBe(userId);
    });

    it('logs out the user', () => {
        const token = 'abc123';
        const userId = 'user-001';

        useAuthStore.getState().login(token, userId);
        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.loggedIn).toBe(false);
        expect(state.userId).toBe('');
        expect(localStorage.getItem('token')).toBeNull();
    });
});
