import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StatusChecker from '@/components/status-checker';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const dbUser = await prisma.user.upsert({
        where: { email: user.email! },
        update: {},
        create: { email: user.email!, isFirstLogin: true },
    });
    if (!dbUser) redirect('/dashboard');

    const allContracts = await prisma.contract.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' }
    });

    const todos = await prisma.todo.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'asc' }
    });

    const completedContracts = allContracts.filter(c => c.status === 'COMPLETED');
    const analyzingCount = allContracts.filter(c => c.status === 'ANALYZING' || c.status === 'PENDING_REVIEW').length;
    const avgRisk = completedContracts.length > 0
        ? Math.round(completedContracts.reduce((acc, c) => acc + c.riskScore, 0) / completedContracts.length)
        : 0;
    const highRiskCount = completedContracts.filter(c => c.riskScore > 70).length;
    const recentContracts = allContracts.slice(0, 8); // pass more so filters have data to work with
    const isAnalyzing = analyzingCount > 0;

    const upcomingDeadlines = allContracts
        .filter(c => c.expirationDate !== null)
        .sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime())
        .slice(0, 3);

    return (
        <>
            <StatusChecker status={isAnalyzing ? "ANALYZING" : "COMPLETED"} />
            <DashboardClient
                user={{ email: user.email! }}
                dbUserId={dbUser.id}
                totalContracts={allContracts.length}
                avgRisk={avgRisk}
                highRiskCount={highRiskCount}
                analyzingCount={analyzingCount}
                recentContracts={recentContracts}
                upcomingDeadlines={upcomingDeadlines}
                todos={todos}
                isAnalyzing={isAnalyzing}
            />
        </>
    );
}