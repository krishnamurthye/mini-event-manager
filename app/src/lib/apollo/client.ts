// lib/apollo/clinet.ts
import {ApolloClient, from, HttpLink, InMemoryCache} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {setContext} from '@apollo/client/link/context';
import {errorHandlerFn} from './errorHandler';

const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});


// Set token dynamically before each request
const authLink = setContext((_, {headers}) => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token'); // Get token each time
    }

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const errorLink = onError(errorHandlerFn);
export const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  name: 'mini-event-manager-web',
  version: '0.1.0',
});