import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashApiKey } from './api-key-helper';

export async function authenticateApiKey(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: 'Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_KEY' };
    }

    const key = authHeader.slice(7);
    if (!key.startsWith('cg_')) {
        return { user: null, error: 'Invalid API key format' };
    }

    const keyHash = hashApiKey(key);

    const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { user: true },
    });

    if (!apiKey) {
        return { user: null, error: 'Invalid API key' };
    }

    // Update last used timestamp
    await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
    });

    return { user: apiKey.user, error: null };
}

export function apiError(message: string, status: number) {
    return Response.json({ success: false, error: message }, { status });
}

export function apiSuccess(data: any, status = 200) {
    return Response.json({ success: true, ...data }, { status });
}