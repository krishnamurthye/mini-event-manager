// client.test.ts
// import { handleAuthError } from '../errorHandler';
// import { errorHandlerFn,  } from '../errorHandler';
import {toast} from 'react-hot-toast';
import {ErrorResponse} from '@apollo/client/link/error';
import {Operation} from '@apollo/client';
import {DocumentNode} from 'graphql';
import * as ErrorHandler from '../errorHandler';

jest.mock('mini-event/lib/store/authStore', () => ({
    useAuthStore: {
        getState: () => ({
            logout: jest.fn(),
        }),
    },
}));

jest.mock('react-hot-toast', () => ({
    toast: {
        error: jest.fn(),
    },
}));

const mockOperation: Operation = {
    query: {} as DocumentNode,
    variables: {},
    operationName: 'MockOp',
    getContext: () => ({}),
    setContext: () => ({}),
    extensions: {},
};

const dummyForward = () => {
    throw new Error("Forward function should not be called in this test");
};

function createMockErrorResponse(
    graphQLErrors: { message: string }[] | undefined,
    networkError: Error | null
): ErrorResponse {
    return {
        graphQLErrors,
        networkError,
        operation: mockOperation,
        forward: dummyForward,
    };
}

jest.mock('../errorHandler', () => ({
    ...jest.requireActual('../errorHandler'),
    handleAuthError: jest.fn(),
}));

describe('Apollo error handler', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls toast.error with GraphQL error message', () => {
        const errorResponse = createMockErrorResponse([{message: 'Something went wrong'}], null);

        ErrorHandler.errorHandlerFn(errorResponse);
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });

    // moved to global auth handler
    // it('calls toast.error with unauthorized error message', () => {
    //     const errorResponse = createMockErrorResponse(
    //         [{ message: 'Unauthorized' }],
    //         null
    //     );
    //
    //     ErrorHandler.errorHandlerFn(errorResponse);
    //     expect(toast.error).toHaveBeenCalledWith('Session has expired, Please log in again.');
    // });

    it('calls toast.error on network error', () => {
        const error = new Error('Network fail');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        const errorResponse = createMockErrorResponse(
            [],
            new Error('Network fail'),
        );

        ErrorHandler.errorHandlerFn(errorResponse);
        expect(consoleSpy).toHaveBeenCalledWith('[Network Error]:', error);
        expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection.');

        consoleSpy.mockRestore();
    });

});
