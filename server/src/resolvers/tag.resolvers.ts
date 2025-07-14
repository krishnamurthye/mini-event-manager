// server/src/resolver/tag.resolvers.ts
import {
    createTag,
    getTags,
    searchTags,
} from '../data.js';
import {requireAuth } from "../utils/requireAuth.js";
import { MiniActivityContext } from '../types/context.js';
import {logger} from "../utils/logger.js";

export const tagResolvers = {
    Query: {
        tags: () => getTags(),
        searchTags: (_: unknown, {query}: { query: string }) => searchTags(query),
    },

    Mutation: {
        createTag: requireAuth(
            (_: unknown, {label}: { label: string }, _context: MiniActivityContext) => {
                const { correlationId } = _context;

                logger.info(`[${correlationId}] [Auth] Attempt create tag: ${label}`);
                return createTag(label);
            }
        ),

    },
};
