// jest.setup.js
import '@testing-library/jest-dom';

// Optional: Mock router for App Router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
    useParams: () => ({}),
}));


Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    writable: true,
});

class ResizeObserver {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
}

global.ResizeObserver = ResizeObserver;