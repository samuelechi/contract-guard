'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/api-key-helper';
import { revalidatePath } from 'next/cache';

async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user;
}

export async function createApiKey(label: string): Promise<{ success: boolean; key?: string; error?: string }> {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { success: false, error: 'User not found' };

        // Limit to 5 API keys per user
        const count = await prisma.apiKey.count({ where: { userId: dbUser.id } });
        if (count >= 5) return { success: false, error: 'Maximum of 5 API keys allowed' };

        const { key, keyHash, keyPreview } = generateApiKey();

        await prisma.apiKey.create({
            data: {
                userId: dbUser.id,
                label: label || 'My API Key',
                keyHash,
                keyPreview,
            },
        });

        revalidatePath('/dashboard/api');

        // Return the full key ONCE — it won't be shown again
        return { success: true, key };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { success: false, error: 'User not found' };

        await prisma.apiKey.deleteMany({
            where: { id: keyId, userId: dbUser.id },
        });

        revalidatePath('/dashboard/api');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getApiKeys() {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return [];

        return await prisma.apiKey.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                label: true,
                keyPreview: true,
                lastUsedAt: true,
                createdAt: true,
            },
        });
    } catch {
        return [];
    }
}