// server/src/utils/requireAuth.ts
import {GraphQLResolveInfo} from 'graphql';

export function requireAuth<TParent, TArgs, TContext extends { userId?: string }, TReturn>(
    resolver: (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TReturn
) {
    return (
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo
    ): TReturn => {
        if (!context.userId) {
            throw new Error('Unauthorized');
        }
        return resolver(parent, args, context, info);
    };
}


// utils/requireOwnership.ts
export function requireOwnership<TParent, TArgs, TContext extends { userId?: string }, TReturn>(
    getResourceUserId: (args: TArgs) => string | Promise<string>,
    resolver: (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TReturn
) {
    return async (
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo
    ): Promise<TReturn> => {
        const ownerId = await getResourceUserId(args);
        if (ownerId !== context.userId) {
            throw new Error('Forbidden');
        }
        return resolver(parent, args, context, info);
    };
}
