import 'cross-fetch/polyfill';
// import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from '@apollo/client';
// import { render } from '@testing-library/react';
// import React from 'react';
// const client = new ApolloClient({
//     link: new HttpLink({ uri: 'http://localhost:4000/graphql' }),
//     cache: new InMemoryCache(),
// });
//
// export function renderWithApollo(ui: React.ReactNode) {
//     return render(<ApolloProvider client={client}>{ui}</ApolloProvider>);
// }
import {MockedProvider, MockedResponse} from '@apollo/client/testing';
import {render} from '@testing-library/react';

export function renderWithApollo(ui: React.ReactNode, mocks: MockedResponse[] = []) {
    return render(<MockedProvider mocks={mocks} addTypename={false}>{ui}</MockedProvider>);
}
