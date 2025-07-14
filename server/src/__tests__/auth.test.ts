import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import {resolvers} from '../resolvers';
import {credentials, persons, users} from '../data';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {MiniActivityContext} from "../types/context";
import {GraphQLResolveInfo} from "graphql/index";

const context = { correlationId: 'test-correlation-id' } as MiniActivityContext;

beforeEach(() => {
    // reset in-memory data
    persons.length = 0;
    users.length = 0;
    credentials.length = 0;
});

describe('Auth Resolvers', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'securepass';
    const testName = 'Test User';

    it('registers a new user', async () => {
        const user = await resolvers.Mutation.registerUser(null, {
            name: testName,
            email: testEmail,
            password: testPassword,
        }, context,  {} as GraphQLResolveInfo);

        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('personId');
        expect(persons.length).toBe(1);
        expect(users.length).toBe(1);
        expect(credentials.length).toBe(1);

        const cred = credentials[0];
        expect(cred.identifier).toBe(testEmail);
        expect(await bcrypt.compare(testPassword, cred.passwordHash!)).toBe(true);
    });

    it('throws error on duplicate email registration', async () => {
        await resolvers.Mutation.registerUser(null, {
            name: testName,
            email: testEmail,
            password: testPassword,
        }, context,  {} as GraphQLResolveInfo);

        await expect(
            resolvers.Mutation.registerUser(null, {
                name: 'Another',
                email: testEmail,
                password: '123',
            }, context,  {} as GraphQLResolveInfo)
        ).rejects.toThrow('Email already registered');
    });

    it('logs in with correct credentials and returns token', async () => {
        const registered = await resolvers.Mutation.registerUser(null, {
            name: testName,
            email: testEmail,
            password: testPassword,
        }, context,  {} as GraphQLResolveInfo);

        const {token, user} = await resolvers.Mutation.loginUser(null, {
            email: testEmail,
            password: testPassword,
        }, context,  {} as GraphQLResolveInfo);

        expect(token).toBeDefined();
        const payload: any = jwt.verify(token, 'mini-event-secret');
        expect(payload.userId).toBe(user.id);
        expect(user.personId).toBe(registered.personId);
    });

    it('throws error for wrong password', async () => {
        await resolvers.Mutation.registerUser(null, {
            name: testName,
            email: testEmail,
            password: testPassword,
        }, context,  {} as GraphQLResolveInfo);

        await expect(
            resolvers.Mutation.loginUser(null, {
                email: testEmail,
                password: 'wrongpass',
            }, context,  {} as GraphQLResolveInfo)
        ).rejects.toThrow('Invalid credentials1');
    });

    it('throws error for unregistered email', async () => {
        await expect(
            resolvers.Mutation.loginUser(null, {
                email: 'ghost@example.com',
                password: 'pass',
            }, context,  {} as GraphQLResolveInfo)
        ).rejects.toThrow('User not found');
    });

    it('successfully logs in and returns a valid JWT token', async () => {
        // Register the user first
        const registeredUser = await resolvers.Mutation.registerUser(null, {
            name: 'Test Login',
            email: 'login@test.com',
            password: 'mypassword',
        }, context,  {} as GraphQLResolveInfo);

        // Attempt login
        const result = await resolvers.Mutation.loginUser(null, {
            email: 'login@test.com',
            password: 'mypassword',
        }, context,  {} as GraphQLResolveInfo);

        // Expect token and user
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('user');
        expect(result.user.id).toBe(registeredUser.id);

        // Verify JWT token
        const decoded: any = jwt.verify(result.token, 'mini-event-secret');
        expect(decoded.userId).toBe(registeredUser.id);
    });

});
