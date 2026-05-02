import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
    const { user, error } = await authenticateApiKey(req);
    if (!user) return apiError(error!, 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    const where = {
        userId: user.id,
        ...(status && { status: status.toUpperCase() }),
    };

    const [contracts, total] = await Promise.all([
        prisma.contract.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                status: true,
                riskScore: true,
                createdAt: true,
                expirationDate: true,
                fileUrl: true,
            },
        }),
        prisma.contract.count({ where }),
    ]);

    return apiSuccess({
        contracts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
}