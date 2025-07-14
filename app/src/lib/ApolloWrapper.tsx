'use client';

import * as React from 'react'; // ✅ Required in .tsx using JSX (for type `React.ReactNode`)
import {ApolloProvider} from '@apollo/client';
import {client} from './apollo/client';

export default function ApolloWrapper({children}: { children: React.ReactNode }) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
