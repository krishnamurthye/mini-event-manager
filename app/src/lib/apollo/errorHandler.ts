import {ErrorResponse} from '@apollo/client/link/error';
import {toast} from 'react-hot-toast';
import {useErrorStore} from 'mini-event/lib/store/errorStore';

export const errorHandlerFn = ({ graphQLErrors, networkError }: ErrorResponse) => {
    if (graphQLErrors?.length) {
        for (const err of graphQLErrors) {
            const msg = err.message?.toLowerCase?.() || '';

            if (msg.includes('unauthorized') || msg.includes('unauthenticated')) {
                console.error('[Auth Error]:', err);
                try {
            useErrorStore.getState().setAuthError(true);
                } catch (e) {
                    console.error('Error accessing error store', e);
                }
            return;
        }

            console.error(`[GraphQL error]: ${err.message}`, {
                path: err.path,
                code: err.extensions?.code,
            });
        }

        const firstMessage = graphQLErrors[0]?.message;
        if (firstMessage && !firstMessage.toLowerCase().includes('internal')) {
            toast.error(firstMessage);
        } else {
            toast.error('Something went wrong. Please try again.');
        }
    }

    if (networkError) {
        console.error('[Network Error]:', networkError);
        toast.error('Network error. Please check your connection.');
    }
};
