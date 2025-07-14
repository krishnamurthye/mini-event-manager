// src/utils/env.ts
export function getEnvOrThrow(key: string): string {
    const val = process.env[key];
    if (!val) {
        throw new Error(`Missing required env var: ${key}`);
    }
    return val;
}

export function getExpiresInRaw() {
    const expiresInRaw = getEnvOrThrow('EXPIRES_IN');
    if (!/^(\d+[smhd])$/.test(expiresInRaw)) {
        throw new Error('Invalid EXPIRES_IN format. Use like "3600s", "1h", "30m" etc.');
    }
    return expiresInRaw;
}
