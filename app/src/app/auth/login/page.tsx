// app/auth/login/page.tsx
'use client';

import LoginForm from './LoginForm';

export default function LoginPage() {
    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <LoginForm/>
        </div>
    );
}
