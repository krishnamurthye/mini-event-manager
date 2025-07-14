// server/src/utils/validate.ts
import {ZodSchema, ZodError, z} from 'zod';
import { GraphQLResolveInfo } from 'graphql';

export class ValidationError extends Error {
    public readonly issues: ZodError['issues'];
    constructor(message: string, issues: ZodError['issues']) {
        super(message);
        this.name = 'ValidationError';
        this.issues = issues;
    }
}

export function validate<T extends ZodSchema<any>>(schema: T) {
    return function <
        Parent = unknown,
        Context = unknown,
        ReturnType = unknown
    >(
        resolver: (
            parent: Parent,
            args: z.infer<T>,
            context: Context,
            info: GraphQLResolveInfo
        ) => ReturnType | Promise<ReturnType>
    ) {
        return async function (
            parent: Parent,
            args: unknown,
            context: Context,
            info: GraphQLResolveInfo
        ): Promise<ReturnType> {
            try {
                const parsed = schema.parse(args);
                return await resolver(parent, parsed, context, info);
            } catch (err) {
                if (err instanceof ZodError) {
                    throw new ValidationError('Invalid input', err.issues);
                }
                throw err;
            }
        };
    };
}
