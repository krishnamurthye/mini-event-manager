// server/src/resolver/auth.resolvers.ts
import {
    credentials,
    persons,
    users,
} from '../data.js';
import {v4 as uuid} from 'uuid';
import bcrypt from 'bcryptjs';
import {signToken, EXPIRES_IN} from "../utils/jwt.js";
import {SignOptions} from "jsonwebtoken";
import {z} from "zod";
import {NotFoundError} from "../errors/general.js";
import {UnauthorizedError} from "../errors/login.js";
import {logger} from "../utils/logger.js";
import { MiniActivityContext } from '../types/context.js';
import { registerSchema } from '../middleware/validation/registerSchema.js';
import { validate } from '../middleware/validate.js';
import {ValidationError} from "apollo-server";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const authResolvers = {
    registerUser: validate(registerSchema)(
        async (_, {name, email, password}, context:MiniActivityContext) => {
            const {correlationId} = context;

            logger.info(`[${correlationId}] [Auth] Registering user: ${email}`);

            if (persons.some(p => p.email === email)) {
                logger.warn(`[${correlationId}] [Auth] Email already registered: ${email}`);
                throw new ValidationError('Email already registered');
            }

            const person = {id: uuid(), name, email, createdAt: new Date().toISOString()};
            persons.push(person);

            const user = {id: uuid(), personId: person.id, createdAt: new Date().toISOString()};
            users.push(user);

            const hash = await bcrypt.hash(password, 10);
            credentials.push({
                id: uuid(),
                userId: user.id,
                provider: 'EMAIL',
                identifier: email,
                passwordHash: hash,
                createdAt: new Date().toISOString(),
            });

            logger.info(`[${correlationId}] [Auth] Registration successful: userId=${user.id}`);
            return user;
        }
    ),

    loginUser: validate(loginSchema)(
        async (_, { email, password }, context: MiniActivityContext) => {
            const { correlationId } = context;

            logger.info(`[${correlationId}] [Auth] Attempt login: ${email}`);

            const cred = credentials.find(c => c.identifier === email && c.provider === 'EMAIL');
            if (!cred) {
                logger.warn(`[${correlationId}] [Auth] Login failed - no credentials for: ${email}`);
                throw new NotFoundError('User not found');
            }

            const valid = await bcrypt.compare(password, cred.passwordHash!);
            if (!valid) {
                logger.warn(`[${correlationId}] [Auth] Login failed - invalid password for: ${email}`);
                throw new UnauthorizedError('Invalid credentials');
            }

            const user = users.find(u => u.id === cred.userId);
            if (!user) {
                logger.error(`[${correlationId}] [Auth] Login failed - user record missing for credential: ${cred.userId}`);
                throw new NotFoundError('User not found');
            }

            const token = signToken({ userId: user.id }, {
                expiresIn: EXPIRES_IN as SignOptions['expiresIn'],
            });

            logger.info(`[${correlationId}] [Auth] Login successful: userId=${user.id}`);

            return { user, token };
        }
    ),
};
