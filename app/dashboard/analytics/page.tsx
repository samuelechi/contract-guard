import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, TrendingUp, FileCheck, AlertTriangle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import RiskChart from "./risk-chart";

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) redirect("/dashboard");

    const contracts = await prisma.contract.findMany({
        where: { userId: dbUser.id, status: "COMPLETED" },
        select: { riskScore: true, createdAt: true, name: true }
    });

    const totalProcessed = contracts.length;
    const highRisk = contracts.filter(c => c.riskScore > 70).length;
    const medRisk = contracts.filter(c => c.riskScore > 30 && c.riskScore <= 70).length;
    const lowRisk = contracts.filter(c => c.riskScore <= 30).length;
    const avgRisk = totalProcessed > 0
        ? Math.round(contracts.reduce((acc, c) => acc + c.riskScore, 0) / totalProcessed)
        : 0;

    const stats = [
        {
            label: "Avg Risk Score",
            value: `${avgRisk}%`,
            icon: TrendingUp,
            iconColor: "text-blue-600 dark:text-blue-400",
            iconBg: "bg-blue-50 dark:bg-blue-500/10",
            accent: null,
        },
        {
            label: "Safe Documents",
            value: lowRisk,
            icon: FileCheck,
            iconColor: "text-emerald-600 dark:text-emerald-400",
            iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
            accent: "border-l-4 border-l-emerald-500",
        },
        {
            label: "Medium Risk",
            value: medRisk,
            icon: AlertTriangle,
            iconColor: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-50 dark:bg-amber-500/10",
            accent: "border-l-4 border-l-amber-500",
        },
        {
            label: "High Risk",
            value: highRisk,
            icon: ShieldAlert,
            iconColor: "text-red-600 dark:text-red-400",
            iconBg: "bg-red-50 dark:bg-red-500/10",
            accent: "border-l-4 border-l-red-500",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 transition-colors duration-200">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0" />
                    <div>
                        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Risk Analytics</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">Deep insights into your legal document health</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

                {/* STAT CARDS — 2 cols mobile, 4 cols lg */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className={`bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1e2d45] shadow-sm ${stat.accent ?? ''}`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-6">
                                <CardTitle className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    {stat.label}
                                </CardTitle>
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                                    <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.iconColor}`} />
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* CHARTS — stacked on mobile, side by side on lg */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

                    {/* Risk Distribution Chart */}
                    <Card className="shadow-sm border-slate-200 dark:border-[#1e2d45] bg-white dark:bg-[#111827]">
                        <CardHeader className="px-5 sm:px-6">
                            <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-white">Risk Distribution</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                                Breakdown of contract safety levels across your database.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 sm:h-80 px-5 sm:px-6">
                            <RiskChart data={contracts} />
                        </CardContent>
                    </Card>

                    {/* AI Insight */}
                    <Card className="shadow-sm border-slate-200 dark:border-[#1e2d45] bg-white dark:bg-[#111827] flex flex-col justify-center items-center p-6 sm:p-8 text-center">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                            <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">AI Insight</h3>
                        {totalProcessed === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm text-sm">
                                Upload and analyze contracts to get AI-powered insights about your legal health.
                            </p>
                        ) : (
                            <>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm text-sm leading-relaxed">
                                    {avgRisk > 50
                                        ? "Your average risk score is higher than normal. We recommend reviewing your high risk contracts immediately."
                                        : "Your legal health looks great! Most of your documents are well within standard safety parameters."}
                                </p>
                                <div className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold ${avgRisk > 50
                                    ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    {avgRisk > 50 ? `⚠️ ${highRisk} contract${highRisk !== 1 ? 's' : ''} need urgent review` : `✅ ${lowRisk} safe contract${lowRisk !== 1 ? 's' : ''} out of ${totalProcessed}`}
                                </div>
                            </>
                        )}
                    </Card>
                </div>

                {/* Risk breakdown table — only show if contracts exist */}
                {totalProcessed > 0 && (
                    <Card className="shadow-sm border-slate-200 dark:border-[#1e2d45] bg-white dark:bg-[#111827]">
                        <CardHeader className="px-5 sm:px-6">
                            <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-white">Risk Breakdown</CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Distribution across risk levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-5 sm:px-6 pb-5 space-y-4">
                            {[
                                { label: 'Low Risk', count: lowRisk, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
                                { label: 'Medium Risk', count: medRisk, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
                                { label: 'High Risk', count: highRisk, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
                            ].map((row) => (
                                <div key={row.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.label}</span>
                                        <span className={`text-sm font-bold ${row.textColor}`}>
                                            {row.count} ({totalProcessed > 0 ? Math.round((row.count / totalProcessed) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-[#1a2235] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${row.color}`}
                                            style={{ width: `${totalProcessed > 0 ? (row.count / totalProcessed) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
        </svg>
    );
}