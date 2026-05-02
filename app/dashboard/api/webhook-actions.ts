'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user;
}

// ─── Fire a webhook ───────────────────────────────────────────────────────────
export async function fireWebhook(webhookId: string, event: string, payload: object) {
    const webhook = await prisma.webhook.findUnique({ where: { id: webhookId } });
    if (!webhook || !webhook.isActive) return;

    try {
        const res = await fetch(webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ContractGuard-Event': event,
                'X-ContractGuard-Timestamp': new Date().toISOString(),
            },
            body: JSON.stringify({
                event,
                timestamp: new Date().toISOString(),
                data: payload,
            }),
            signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        await prisma.webhook.update({
            where: { id: webhookId },
            data: {
                lastFiredAt: new Date(),
                lastStatus: res.status,
            },
        });

        return { success: res.ok, status: res.status };
    } catch (e: any) {
        await prisma.webhook.update({
            where: { id: webhookId },
            data: {
                lastFiredAt: new Date(),
                lastStatus: 0,
            },
        });
        return { success: false, status: 0 };
    }
}

// ─── Fire all matching webhooks for a user + event ────────────────────────────
export async function fireWebhooksForUser(userId: string, event: string, payload: object) {
    const webhooks = await prisma.webhook.findMany({
        where: {
            userId,
            isActive: true,
            events: { has: event },
        },
    });

    await Promise.allSettled(
        webhooks.map(wh => fireWebhook(wh.id, event, payload))
    );
}

// ─── Create webhook ───────────────────────────────────────────────────────────
export async function createWebhook(
    label: string,
    url: string,
    events: string[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { success: false, error: 'User not found' };

        if (!url.startsWith('https://') && !url.startsWith('http://')) {
            return { success: false, error: 'URL must start with http:// or https://' };
        }
        if (events.length === 0) {
            return { success: false, error: 'Select at least one event' };
        }

        const count = await prisma.webhook.count({ where: { userId: dbUser.id } });
        if (count >= 10) return { success: false, error: 'Maximum of 10 webhooks allowed' };

        await prisma.webhook.create({
            data: { userId: dbUser.id, label, url, events },
        });

        revalidatePath('/dashboard/api');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ─── Delete webhook ───────────────────────────────────────────────────────────
export async function deleteWebhook(webhookId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { success: false, error: 'User not found' };

        await prisma.webhook.deleteMany({ where: { id: webhookId, userId: dbUser.id } });
        revalidatePath('/dashboard/api');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ─── Toggle webhook active state ──────────────────────────────────────────────
export async function toggleWebhook(webhookId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { success: false, error: 'User not found' };

        await prisma.webhook.updateMany({
            where: { id: webhookId, userId: dbUser.id },
            data: { isActive },
        });

        revalidatePath('/dashboard/api');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ─── Test webhook ─────────────────────────────────────────────────────────────
export async function testWebhook(webhookId: string): Promise<{ success: boolean; status?: number; error?: string }> {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { success: false, error: 'User not found' };

        const webhook = await prisma.webhook.findFirst({
            where: { id: webhookId, userId: dbUser.id },
        });
        if (!webhook) return { success: false, error: 'Webhook not found' };

        const result = await fireWebhook(webhookId, 'webhook.test', {
            message: 'This is a test webhook from ContractGuard',
            contractId: 'test-id',
            contractName: 'Test Contract.pdf',
            riskScore: 42,
        });

        return result ?? { success: false, error: 'No response' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ─── Get webhooks ─────────────────────────────────────────────────────────────
export async function getWebhooks() {
    try {
        const user = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return [];

        return await prisma.webhook.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: 'desc' },
        });
    } catch {
        return [];
    }
}