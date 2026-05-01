import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ChatClient from './chat-client';

export default async function ChatPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) redirect('/dashboard');

    const contracts = await prisma.contract.findMany({
        where: { userId: dbUser.id, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            riskScore: true,
            status: true,
            aiSummary: true,
        }
    });

    return <ChatClient contracts={contracts} />;
}