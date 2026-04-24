import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Plus, ShieldAlert, FileText, Clock, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import RecentContractsPage from './component/recent-contract';
import UploadZone from './component/upload-zone';
import { prisma } from '@/lib/prisma';
import StatusChecker from '@/components/status-checker';
import TodoList from './component/todo-list';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';

function getDaysLeft(dateString: Date | null) {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

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

    const totalContracts = allContracts.length;
    const completedContracts = allContracts.filter(c => c.status === 'COMPLETED');
    const analyzingCount = allContracts.filter(c => c.status === 'ANALYZING' || c.status === 'PENDING_REVIEW').length;
    const avgRisk = completedContracts.length > 0
        ? Math.round(completedContracts.reduce((acc, c) => acc + c.riskScore, 0) / completedContracts.length)
        : 0;
    const highRiskCount = completedContracts.filter(c => c.riskScore > 70).length;
    const recentContracts = allContracts.slice(0, 4);
    const isAnalyzing = analyzingCount > 0;

    const upcomingDeadlines = allContracts
        .filter(c => c.expirationDate !== null)
        .sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime())
        .slice(0, 3);

    return (
        <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <StatusChecker status={isAnalyzing ? "ANALYZING" : "COMPLETED"} />

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-6 py-4 flex justify-between items-center gap-4 transition-colors duration-200">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Welcome back, {user.email?.split('@')[0]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Button asChild variant="outline" className="bg-transparent border-slate-200 dark:border-[#263652] text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-transparent transition-colors">
                        <Link href="/dashboard/contracts">View History</Link>
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                        <Link href="/dashboard/upload">
                            <Plus className="mr-2 h-4 w-4" />New Analysis
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {totalContracts === 0 ? (
                    <main className="flex flex-col items-center justify-center py-20">
                        <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-10 text-center shadow-sm transition-colors duration-200">
                            <div className="mx-auto bg-blue-50 dark:bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                <ShieldAlert className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Your First Contract</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Upload a PDF agreement to instantly extract risks, summaries, and deadlines.</p>
                            <UploadZone />
                        </div>
                    </main>
                ) : (
                    <>
                        {/* STAT CARDS */}
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                            {/* Total Documents */}
                            <div className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] hover:border-slate-300 dark:hover:border-[#263652] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-blue-500 to-cyan-400 rounded-t-2xl" />
                                <div className="flex items-start justify-between mb-5">
                                    <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Total Documents</span>
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-4xl font-semibold font-mono text-slate-900 dark:text-white tracking-tight">{totalContracts}</div>
                                <p className="text-xs text-slate-400 mt-2">Stored securely</p>
                                <div className="mt-5 h-1 bg-slate-100 dark:bg-[#1a2235] rounded-full overflow-hidden">
                                    <div className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${Math.min(totalContracts * 10, 100)}%` }} />
                                </div>
                            </div>

                            {/* Avg Risk Score */}
                            <div className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] hover:border-slate-300 dark:hover:border-[#263652] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-emerald-500 to-green-400 rounded-t-2xl" />
                                <div className="flex items-start justify-between mb-5">
                                    <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Avg Risk Score</span>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${avgRisk > 50 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
                                        <ShieldAlert className={`h-5 w-5 ${avgRisk > 50 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                    </div>
                                </div>
                                <div className="text-4xl font-semibold font-mono text-slate-900 dark:text-white tracking-tight">
                                    {avgRisk}<span className="text-lg text-slate-400 dark:text-slate-500">/100</span>
                                </div>
                                <p className={`text-xs mt-2 font-medium ${avgRisk > 50 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {avgRisk > 50 ? 'Elevated risk' : 'Low risk overall'}
                                </p>
                                <div className="mt-5 h-1 bg-slate-100 dark:bg-[#1a2235] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${avgRisk > 50 ? 'bg-linear-to-r from-red-500 to-red-400' : 'bg-linear-to-r from-emerald-500 to-green-400'}`} style={{ width: `${avgRisk}%` }} />
                                </div>
                            </div>

                            {/* Critical Alerts */}
                            <div className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] hover:border-slate-300 dark:hover:border-[#263652] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-amber-500 to-yellow-400 rounded-t-2xl" />
                                <div className="flex items-start justify-between mb-5">
                                    <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Critical Alerts</span>
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                    </div>
                                </div>
                                <div className="text-4xl font-semibold font-mono text-slate-900 dark:text-white tracking-tight">{highRiskCount}</div>
                                <p className="text-xs text-slate-400 mt-2">Contracts &gt; 70 risk</p>
                                <div className="mt-5 h-1 bg-slate-100 dark:bg-[#1a2235] rounded-full overflow-hidden">
                                    <div className="h-full bg-linear-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${Math.min(highRiskCount * 20, 100)}%` }} />
                                </div>
                            </div>

                            {/* Pending Review */}
                            <div className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] hover:border-slate-300 dark:hover:border-[#263652] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-red-500 to-rose-400 rounded-t-2xl" />
                                <div className="flex items-start justify-between mb-5">
                                    <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Pending Review</span>
                                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-red-500 dark:text-red-400" />
                                    </div>
                                </div>
                                <div className="text-4xl font-semibold font-mono text-slate-900 dark:text-white tracking-tight">{analyzingCount}</div>
                                <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">Currently analyzing</p>
                                <div className="mt-5 h-1 bg-slate-100 dark:bg-[#1a2235] rounded-full overflow-hidden">
                                    <div className="h-full bg-linear-to-r from-red-500 to-rose-400 rounded-full" style={{ width: `${Math.min(analyzingCount * 20, 100)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* MAIN GRID */}
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-7 lg:grid-cols-3">

                            {/* LEFT — Recent Contracts */}
                            <div className="md:col-span-4 lg:col-span-2">
                                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
                                    <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-[#1e2d45]">
                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Contracts</h2>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your latest uploaded and analyzed agreements</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {['All', 'High Risk', 'Pending'].map((f, i) => (
                                                <button key={f} className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all ${i === 0
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
                                                        : 'bg-transparent border-slate-200 dark:border-[#263652] text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400'
                                                    }`}>
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-7 py-5">
                                        <RecentContractsPage recentContracts={recentContracts} />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="md:col-span-3 lg:col-span-1 space-y-6">

                                {/* Upcoming Deadlines */}
                                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
                                    <div className="px-7 py-5 border-b border-slate-100 dark:border-[#1e2d45] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Deadlines</h2>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Contracts requiring attention</p>
                                        </div>
                                    </div>
                                    <div className="px-7 py-4 space-y-2">
                                        {upcomingDeadlines.length > 0 ? (
                                            upcomingDeadlines.map(contract => {
                                                const daysLeft = getDaysLeft(contract.expirationDate);
                                                const isUrgent = daysLeft !== null && daysLeft <= 14;
                                                return (
                                                    <div key={contract.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${isUrgent
                                                            ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/15'
                                                            : 'bg-slate-50 dark:bg-[#1a2235] border-slate-100 dark:border-[#1e2d45]'
                                                        }`}>
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-100 dark:bg-red-500/10' : 'bg-slate-200 dark:bg-slate-700/50'}`}>
                                                            {isUrgent
                                                                ? <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                                : <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <Link href={`/dashboard/contracts/${contract.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors">
                                                                {contract.name}
                                                            </Link>
                                                            <p className={`text-xs mt-1 font-medium ${isUrgent ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                                {daysLeft !== null ? (daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `Expires in ${daysLeft} days`) : 'No date'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-[#1a2235] rounded-xl flex items-center justify-center mx-auto mb-3">
                                                    <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <p className="text-sm text-slate-400 dark:text-slate-500">No upcoming deadlines</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Items */}
                                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
                                    <div className="px-7 py-5 border-b border-slate-100 dark:border-[#1e2d45] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Action Items</h2>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Tasks and follow-ups</p>
                                        </div>
                                    </div>
                                    <div className="px-7 py-5">
                                        <TodoList initialTodos={todos} userId={dbUser.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}