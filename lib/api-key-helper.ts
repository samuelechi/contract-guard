import crypto from 'crypto';

// Generate a new API key
export function generateApiKey(): { key: string; keyHash: string; keyPreview: string } {
    const key = `cg_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const keyPreview = `${key.slice(0, 8)}...${key.slice(-4)}`;
    return { key, keyHash, keyPreview };
}

// Hash an incoming key for comparison
export function hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
}