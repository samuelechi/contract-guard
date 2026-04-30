"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Plus, ShieldAlert, FileText, Clock, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import RecentContractsPage from './component/recent-contract';
import UploadZone from './component/upload-zone';
import TodoList from './component/todo-list';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Contract {
    id: string;
    name: string;
    riskScore: number;
    status: string;
    createdAt: Date | string;
    expirationDate: Date | null;
}

interface Todo {
    id: string;
    task: string;
    isDone: boolean;
}

interface DashboardClientProps {
    user: { email: string };
    dbUserId: string;
    totalContracts: number;
    avgRisk: number;
    highRiskCount: number;
    analyzingCount: number;
    recentContracts: Contract[];
    upcomingDeadlines: Contract[];
    todos: Todo[];
    isAnalyzing: boolean;
}

type FilterType = "All" | "High Risk" | "Pending";

function getDaysLeft(dateString: Date | null) {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Client Component ───────────────────────────────────────────────────────────
export default function DashboardClient({
    user,
    dbUserId,
    totalContracts,
    avgRisk,
    highRiskCount,
    analyzingCount,
    recentContracts,
    upcomingDeadlines,
    todos,
}: DashboardClientProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>("All");

    return (
        <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2 transition-colors duration-200">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0" />
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white truncate">Dashboard</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                            Welcome back, {user.email?.split('@')[0]}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <ThemeToggle />
                    <Button asChild variant="outline" className="hidden sm:flex bg-transparent border-slate-200 dark:border-[#263652] text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-transparent transition-colors">
                        <Link href="/dashboard/contracts">View History</Link>
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-9 px-3 sm:px-4">
                        <Link href="/dashboard/upload">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">New Analysis</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {totalContracts === 0 ? (
                    <main className="flex flex-col items-center justify-center py-12 sm:py-20">
                        <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-6 sm:p-10 text-center shadow-sm transition-colors duration-200">
                            <div className="mx-auto bg-blue-50 dark:bg-blue-500/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <ShieldAlert className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Your First Contract</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">
                                Upload a PDF agreement to instantly extract risks, summaries, and deadlines.
                            </p>
                            <UploadZone />
                        </div>
                    </main>
                ) : (
                    <>
                        {/* STAT CARDS */}
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                label="Total Docs"
                                value={totalContracts}
                                sub="Stored securely"
                                subColor="text-slate-400"
                                barColor="from-blue-500 to-cyan-400"
                                barWidth={Math.min(totalContracts * 10, 100)}
                                topBar="from-blue-500 to-cyan-400"
                                icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />}
                                iconBg="bg-blue-50 dark:bg-blue-500/10"
                            />
                            <StatCard
                                label="Avg Risk"
                                value={`${avgRisk}`}
                                valueSuffix="/100"
                                sub={avgRisk > 50 ? 'Elevated risk' : 'Low risk overall'}
                                subColor={avgRisk > 50 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
                                barColor={avgRisk > 50 ? 'from-red-500 to-red-400' : 'from-emerald-500 to-green-400'}
                                barWidth={avgRisk}
                                topBar="from-emerald-500 to-green-400"
                                icon={<ShieldAlert className={`h-4 w-4 sm:h-5 sm:w-5 ${avgRisk > 50 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />}
                                iconBg={avgRisk > 50 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}
                            />
                            <StatCard
                                label="Critical"
                                value={highRiskCount}
                                sub="Risk > 70"
                                subColor="text-slate-400"
                                barColor="from-amber-500 to-yellow-400"
                                barWidth={Math.min(highRiskCount * 20, 100)}
                                topBar="from-amber-500 to-yellow-400"
                                icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 dark:text-amber-400" />}
                                iconBg="bg-amber-50 dark:bg-amber-500/10"
                            />
                            <StatCard
                                label="Pending"
                                value={analyzingCount}
                                sub="Analyzing"
                                subColor="text-amber-500 dark:text-amber-400"
                                barColor="from-red-500 to-rose-400"
                                barWidth={Math.min(analyzingCount * 20, 100)}
                                topBar="from-red-500 to-rose-400"
                                icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400" />}
                                iconBg="bg-red-50 dark:bg-red-500/10"
                            />
                        </div>

                        {/* MAIN GRID */}
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">

                            {/* Recent Contracts */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 dark:border-[#1e2d45] gap-3">
                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Contracts</h2>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your latest uploaded and analyzed agreements</p>
                                        </div>
                                        {/* Filter buttons — functional, wired to state */}
                                        <div className="hidden sm:flex gap-2 shrink-0">
                                            {(["All", "High Risk", "Pending"] as FilterType[]).map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => setActiveFilter(f)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all ${activeFilter === f
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
                                                        : 'bg-transparent border-slate-200 dark:border-[#263652] text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400'
                                                        }`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-4 sm:px-7 py-4 sm:py-5">
                                        <RecentContractsPage
                                            recentContracts={recentContracts}
                                            activeFilter={activeFilter}
                                            onFilterChange={setActiveFilter}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="lg:col-span-1 space-y-6">

                                {/* Upcoming Deadlines */}
                                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
                                    <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 dark:border-[#1e2d45] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Deadlines</h2>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Contracts requiring attention</p>
                                        </div>
                                    </div>
                                    <div className="px-5 sm:px-7 py-4 space-y-2">
                                        {upcomingDeadlines.length > 0 ? (
                                            upcomingDeadlines.map(contract => {
                                                const daysLeft = getDaysLeft(contract.expirationDate);
                                                const isUrgent = daysLeft !== null && daysLeft <= 14;
                                                return (
                                                    <div key={contract.id} className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border transition-colors ${isUrgent
                                                        ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/15'
                                                        : 'bg-slate-50 dark:bg-[#1a2235] border-slate-100 dark:border-[#1e2d45]'
                                                        }`}>
                                                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-100 dark:bg-red-500/10' : 'bg-slate-200 dark:bg-slate-700/50'}`}>
                                                            {isUrgent
                                                                ? <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                                : <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <Link href={`/dashboard/contracts/${contract.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors">
                                                                {contract.name}
                                                            </Link>
                                                            <p className={`text-xs mt-1 font-medium ${isUrgent ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                                {daysLeft !== null
                                                                    ? (daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : `Expires in ${daysLeft}d`)
                                                                    : 'No date'}
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
                                    <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 dark:border-[#1e2d45] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Action Items</h2>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Tasks and follow-ups</p>
                                        </div>
                                    </div>
                                    <div className="px-5 sm:px-7 py-4 sm:py-5">
                                        <TodoList initialTodos={todos} userId={dbUserId} />
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

// ── StatCard helper ────────────────────────────────────────────────────────────
function StatCard({
    label, value, valueSuffix, sub, subColor, barColor, barWidth, topBar, icon, iconBg
}: {
    label: string; value: string | number; valueSuffix?: string;
    sub: string; subColor: string; barColor: string; barWidth: number;
    topBar: string; icon: React.ReactNode; iconBg: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] hover:border-slate-300 dark:hover:border-[#263652] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r ${topBar} rounded-t-2xl`} />
            <div className="flex items-start justify-between mb-3 sm:mb-5">
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 tracking-wide uppercase leading-tight">{label}</span>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl sm:text-4xl font-semibold font-mono text-slate-900 dark:text-white tracking-tight">
                {value}
                {valueSuffix && <span className="text-base sm:text-lg text-slate-400 dark:text-slate-500">{valueSuffix}</span>}
            </div>
            <p className={`text-xs mt-1 sm:mt-2 font-medium ${subColor}`}>{sub}</p>
            <div className="mt-3 sm:mt-5 h-1 bg-slate-100 dark:bg-[#1a2235] rounded-full overflow-hidden">
                <div className={`h-full bg-linear-to-r ${barColor} rounded-full`} style={{ width: `${barWidth}%` }} />
            </div>
        </div>
    );
}