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
            createdAt: true,
            updatedAt: true,
            expirationDate: true,
            fileUrl: true,
        },
    });

    if (!contract) return apiError('Contract not found', 404);

    return apiSuccess({ contract });
}