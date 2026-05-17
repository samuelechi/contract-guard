'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { analyzeContract } from '@/app/ai/analyze';
import { revalidatePath } from 'next/cache';
import { extractTextFromPdf } from '@/lib/pdf-loader';

export async function reanalyzeContract(contractId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) return { success: false, error: 'User not found' };

        const contract = await prisma.contract.findFirst({
            where: { id: contractId, userId: dbUser.id },
        });
        if (!contract) return { success: false, error: 'Contract not found' };

        // Reset to ANALYZING
        await prisma.contract.update({
            where: { id: contractId },
            data: {
                status: 'ANALYZING',
                riskScore: 0,
                aiSummary: null,
                expirationDate: null,
            },
        });

        revalidatePath(`/dashboard/contracts/${contractId}`);

        // Fetch PDF from Supabase Storage
        const fileResponse = await fetch(contract.fileUrl);
        if (!fileResponse.ok) throw new Error('Failed to fetch PDF file');

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use same extractor as upload
        const contractText = await extractTextFromPdf(buffer);

        if (!contractText || contractText.trim().length < 50) {
            throw new Error('Could not extract text from PDF');
        }

        const result = await analyzeContract(contractId, contractText);

        revalidatePath(`/dashboard/contracts/${contractId}`);
        revalidatePath('/dashboard');

        return result;
    } catch (error: any) {
        console.error('❌ Re-analysis error:', error);
        await prisma.contract.update({
            where: { id: contractId },
            data: { status: 'FAILED' },
        }).catch(() => { });

        return { success: false, error: error.message || 'Re-analysis failed' };
    }
}