'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── Helper: get authenticated user or throw ──────────────────────────────────
async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    return { supabase, user };
}

// ─── Update Email ─────────────────────────────────────────────────────────────
export async function updateEmail(formData: FormData): Promise<{ error?: string; success?: string }> {
    const newEmail = formData.get('newEmail') as string;
    const password = formData.get('password') as string;

    if (!newEmail || !password) return { error: 'All fields are required.' };

    try {
        const { supabase, user } = await getAuthUser();

        // Re-authenticate by signing in again to verify the password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password,
        });
        if (signInError) return { error: 'Incorrect password.' };

        // Update the email — Supabase will send a confirmation email to the new address
        const { error: updateError } = await supabase.auth.updateUser(
            { email: newEmail },
            { emailRedirectTo: `https://contract-guard-seven.vercel.app/auth/callback?next=/dashboard/settings` }
        );
        if (updateError) return { error: updateError.message };

        return { success: 'Confirmation email sent to ' + newEmail + '. Check your inbox to complete the change.' };
    } catch (e: any) {
        return { error: e.message || 'Something went wrong.' };
    }
}

// ─── Update Password ──────────────────────────────────────────────────────────
export async function updatePassword(formData: FormData): Promise<{ error?: string; success?: string }> {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword)
        return { error: 'All fields are required.' };
    if (newPassword !== confirmPassword)
        return { error: "New passwords don't match." };
    if (newPassword.length < 8)
        return { error: 'Password must be at least 8 characters.' };
    if (currentPassword === newPassword)
        return { error: 'New password must be different from your current password.' };

    try {
        const { supabase, user } = await getAuthUser();

        // Verify current password first
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword,
        });
        if (signInError) return { error: 'Current password is incorrect.' };

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (updateError) return { error: updateError.message };

        return { success: 'Password updated successfully.' };
    } catch (e: any) {
        return { error: e.message || 'Something went wrong.' };
    }
}

// ─── Update Notification Prefs ────────────────────────────────────────────────
export async function updateNotifications(formData: FormData): Promise<{ error?: string; success?: string }> {
    try {
        const { user } = await getAuthUser();

        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { error: 'User not found.' };

        await prisma.notificationPrefs.upsert({
            where: { userId: dbUser.id },
            update: {
                contractAnalyzed: formData.get('contractAnalyzed') === 'true',
                highRiskDetected: formData.get('highRiskDetected') === 'true',
                deadlineReminders: formData.get('deadlineReminders') === 'true',
                marketingEmails: formData.get('marketingEmails') === 'true',
            },
            create: {
                userId: dbUser.id,
                contractAnalyzed: formData.get('contractAnalyzed') === 'true',
                highRiskDetected: formData.get('highRiskDetected') === 'true',
                deadlineReminders: formData.get('deadlineReminders') === 'true',
                marketingEmails: formData.get('marketingEmails') === 'true',
            },
        });

        revalidatePath('/dashboard/settings');
        return { success: 'Notification preferences saved.' };
    } catch (e: any) {
        return { error: e.message || 'Something went wrong.' };
    }
}

// ─── Delete Account ───────────────────────────────────────────────────────────
export async function deleteAccount(formData: FormData): Promise<{ error?: string }> {
    const confirmText = formData.get('confirmText') as string;
    if (confirmText !== 'delete my account') return { error: 'Confirmation text does not match.' };

    try {
        const { user } = await getAuthUser();

        // 1. Delete all user data from Prisma (cascades to contracts, todos, notif prefs)
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (dbUser) {
            await prisma.user.delete({ where: { id: dbUser.id } });
        }

        // 2. Delete the Supabase Auth user using the admin client
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteError) throw new Error(deleteError.message);

    } catch (e: any) {
        return { error: e.message || 'Failed to delete account.' };
    }

    // Redirect outside try/catch — Next.js redirect() throws internally
    redirect('/');
}

// ─── Update Profile (display name + avatar) ───────────────────────────────────
export async function updateProfile(formData: FormData): Promise<{ error?: string; success?: string; avatarUrl?: string }> {
    try {
        const { supabase, user } = await getAuthUser();

        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { error: 'User not found.' };

        const displayName = formData.get('displayName') as string | null;
        const avatarFile = formData.get('avatar') as File | null;

        let avatarUrl: string | undefined;

        // Upload avatar if provided
        if (avatarFile && avatarFile.size > 0) {
            // Delete old avatar first if exists
            if (dbUser.avatarUrl) {
                const oldPath = dbUser.avatarUrl.split('/avatars/')[1];
                if (oldPath) await supabase.storage.from('avatars').remove([oldPath]);
            }

            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) return { error: 'Failed to upload avatar: ' + uploadError.message };

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            avatarUrl = publicUrl;
        }

        // Save to DB
        await prisma.user.update({
            where: { id: dbUser.id },
            data: {
                ...(displayName !== null && { displayName: displayName || null }),
                ...(avatarUrl && { avatarUrl }),
            },
        });

        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard');
        return { success: 'Profile updated successfully.', avatarUrl };
    } catch (e: any) {
        return { error: e.message || 'Something went wrong.' };
    }
}

// ─── Load Notification Prefs (for server-side initial state) ──────────────────
export async function getNotificationPrefs() {
    try {
        const { user } = await getAuthUser();
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return null;

        return await prisma.notificationPrefs.findUnique({
            where: { userId: dbUser.id },
        });
    } catch {
        return null;
    }
}

// ─── Load Profile (for server-side initial state) ─────────────────────────────
export async function getProfile() {
    try {
        const { user } = await getAuthUser();
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { displayName: true, avatarUrl: true, email: true },
        });
        return dbUser ?? null;
    } catch {
        return null;
    }
}