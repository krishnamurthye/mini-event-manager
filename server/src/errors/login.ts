// server/src/errors/login.ts
export class Login extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'Login';
    }
}

export class UnauthorizedError extends Error {
    code = 'UNAUTHORIZED';
}
export class ValidationError extends Error {
    code = 'VALIDATION_ERROR';
}
