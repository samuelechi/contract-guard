import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-middleware';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { user, error } = await authenticateApiKey(req);
    if (!user) return apiError(error!, 401);

    const { id } = await params;

    const contract = await prisma.contract.findFirst({
        where: { id, userId: user.id },
        select: {
            id: true,
            name: true,
            status: true,
            riskScore: true,
            aiSummary: true,
            expirationDate: true,
        },
    });

    if (!contract) return apiError('Contract not found', 404);
    if (contract.status !== 'COMPLETED') return apiError('Contract analysis not yet complete', 400);
    if (!contract.aiSummary) return apiError('No summary available for this contract', 404);

    return apiSuccess({
        id: contract.id,
        name: contract.name,
        riskScore: contract.riskScore,
        expirationDate: contract.expirationDate,
        summary: contract.aiSummary,
    });
}