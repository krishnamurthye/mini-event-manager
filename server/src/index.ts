// src/index.ts (or server setup file)
import dotenv from 'dotenv';
dotenv.config();

import {ApolloServer} from 'apollo-server';
import {v4 as uuid} from 'uuid';
import {typeDefs} from './schema.js';
import {resolvers} from './resolvers/index.js';
import {verifyToken} from './utils/jwt.js';
import { Login} from './errors/login.js';
import {NotFoundError} from './errors/general.js';
import {getEnvOrThrow} from "./utils/env.js";
import {ValidationError} from './middleware/validate.js';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '').trim();
        const payload = verifyToken(token);
        const correlationId = uuid();

        return {
            userId: payload?.userId,
            correlationId,
        };
    },
    formatError: (err) => {
        const correlationId = uuid();

        if (err.originalError instanceof ValidationError) {
            return {
                message: err.message,
                code: 'BAD_USER_INPUT',
                validationErrors: err.originalError.issues,
                correlationId,
            };
        }

        if (err.originalError instanceof Login) {
            return {
                message: err.message,
                code: 'UNAUTHORIZED',
                correlationId,
            };
        }

        if (err.originalError instanceof NotFoundError) {
            return {
                message: err.message,
                code: 'NOT_FOUND',
                correlationId,
            };
        }

        // fallback
        return {
            message: err.message,
            code: 'INTERNAL_SERVER_ERROR',
            correlationId,
        };
    },
});

const PORT = getEnvOrThrow("PORT") || 4000;
server.listen({port: PORT}).then(({url}) => {
    console.log(`Server ready at ${url}`);
});
