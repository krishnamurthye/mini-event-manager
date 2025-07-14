import jwt from 'jsonwebtoken';
import {getEnvOrThrow, getExpiresInRaw} from "./env.js";
import {logger} from "./logger.js";

const JWT_SECRET = getEnvOrThrow("JWT_SECRET");
export const EXPIRES_IN = getExpiresInRaw()

export interface JwtPayload {
    userId: string;
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        logger.info(`Input token ${token}`);
        const decoded = jwt.verify(token, JWT_SECRET);
        logger.info(`JWT verify token ${decoded}`);
        if (typeof decoded === 'object' && decoded !== null && typeof decoded['userId'] === 'string') {
            return { userId: decoded['userId'] };
        }
        return null;
    } catch (err) {
        const message = (err as Error).message;
        console.error('[verifyToken]', message);
        return null;
    }
}

export function signToken(payload: JwtPayload, options?: jwt.SignOptions): string {
    return jwt.sign(payload, JWT_SECRET, options);
}
