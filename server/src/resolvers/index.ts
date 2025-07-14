import { authResolvers } from './auth.resolvers.js';
import { eventResolvers } from './event.resolvers.js';
import { tagResolvers } from './tag.resolvers.js';

export const resolvers = {
    Query: {
        ...eventResolvers.Query,
        ...tagResolvers.Query,
    },
    Mutation: {
        ...authResolvers,
        ...eventResolvers.Mutation,
        ...tagResolvers.Mutation,
    },
};
