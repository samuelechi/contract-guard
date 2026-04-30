import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Download, FileText, ShieldAlert, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RefreshButton } from "@/components/refresh-button";
import StatusChecker from "@/components/status-checker";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ContractPageProps {
    params: Promise<{ id: string }>
}

export default async function ContractDetailsPage({ params }: ContractPageProps) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return redirect('/login');

    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) return redirect('/dashboard');

    const contract = await prisma.contract.findFirst({ where: { id, userId: dbUser.id } });
    if (!contract) return notFound();

    const isHighRisk = contract.riskScore > 70;
    const isMediumRisk = contract.riskScore > 30 && contract.riskScore <= 70;

    const getStatusBadge = (status: string) => {
        const base = "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border";
        if (status === "COMPLETED") return (
            <span className={`${base} bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />Analyzed
            </span>
        );
        if (status === "FAILED") return (
            <span className={`${base} bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />Failed
            </span>
        );
        return (
            <span className={`${base} bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 animate-pulse`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />Analyzing...
            </span>
        );
    };

    const riskColor = contract.status !== "COMPLETED"
        ? "text-slate-300 dark:text-slate-600"
        : isHighRisk ? "text-red-600 dark:text-red-400"
            : isMediumRisk ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400";

    const riskCardBg = contract.status !== "COMPLETED"
        ? "border-slate-200 dark:border-[#263652] bg-white dark:bg-[#111827]"
        : isHighRisk ? "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5"
            : isMediumRisk ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5"
                : "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5";

    const riskIconBg = contract.status !== "COMPLETED"
        ? "bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500"
        : isHighRisk ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
            : isMediumRisk ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    const barColor = isHighRisk ? "bg-red-500" : isMediumRisk ? "bg-amber-500" : "bg-emerald-500";

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <StatusChecker status={contract.status} />

            {/* TOPBAR */}
            <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-4 sm:px-6 py-3 sm:py-4 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0" />
                        <Button variant="outline" size="icon" asChild className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 bg-transparent border-slate-200 dark:border-[#263652] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#1a2235]">
                            <Link href="/dashboard">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h1 className="text-sm sm:text-lg md:text-xl font-semibold tracking-tight text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-xs md:max-w-none">
                                    {contract.name}
                                </h1>
                                {getStatusBadge(contract.status)}
                            </div>
                            <div className="hidden sm:flex items-center text-xs text-slate-400 dark:text-slate-500 gap-4">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(contract.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5" />
                                    PDF Document
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" className="bg-transparent border-slate-200 dark:border-[#263652] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#1a2235] h-9 px-2 sm:px-4" asChild>
                            <a href={contract.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Original PDF</span>
                            </a>
                        </Button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* 
                    Mobile: stacked (PDF viewer then analysis)
                    Desktop: side-by-side 
                */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 lg:h-[800px] xl:h-[900px]">

                    {/* PDF VIEWER */}
                    <div className="h-72 sm:h-96 lg:h-full flex flex-col overflow-hidden bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl transition-colors duration-200">
                        <div className="py-3 px-4 sm:px-5 bg-slate-50 dark:bg-[#1a2235] border-b border-slate-100 dark:border-[#1e2d45] flex items-center gap-2 shrink-0">
                            <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Document Preview</span>
                        </div>
                        <div className="flex-1 bg-slate-100/50 dark:bg-[#0f1825] min-h-0">
                            {contract.fileUrl ? (
                                <iframe
                                    className="w-full h-full border-0"
                                    src={`${contract.fileUrl}#view=FitH`}
                                    title="Contract PDF"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                    <FileText className="h-14 w-14 mb-4 opacity-30" />
                                    <p className="text-sm">PDF Preview Unavailable</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI ANALYSIS */}
                    <div className="flex flex-col gap-4 sm:gap-5 lg:h-full lg:overflow-y-auto lg:pr-1">

                        {/* RISK SCORE */}
                        <div className={`rounded-2xl border-2 p-4 sm:p-6 transition-colors duration-200 ${riskCardBg}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Overall Risk Score</p>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-4xl sm:text-5xl font-bold tracking-tighter font-mono ${riskColor}`}>
                                            {contract.status === "COMPLETED" ? contract.riskScore : "--"}
                                        </span>
                                        <span className="text-lg sm:text-xl text-slate-400 dark:text-slate-500 mb-1">/ 100</span>
                                    </div>
                                </div>
                                <div className={`p-2.5 sm:p-3 rounded-2xl ${riskIconBg}`}>
                                    {contract.status !== "COMPLETED"
                                        ? <ShieldAlert className="h-6 w-6 sm:h-7 sm:w-7" />
                                        : isHighRisk
                                            ? <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
                                            : <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7" />}
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-5 w-full bg-slate-200/60 dark:bg-[#1a2235] rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                                    style={{ width: contract.status === "COMPLETED" ? `${Math.max(contract.riskScore, 2)}%` : '0%' }}
                                />
                            </div>
                            <p className="mt-3 sm:mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                {contract.status !== "COMPLETED" ? "Awaiting analysis..."
                                    : isHighRisk ? "⚠️ High risk clauses detected. Urgent review required."
                                        : isMediumRisk ? "⚠️ Moderate risks detected. Proceed with caution."
                                            : "✅ Document appears generally safe, but review is still recommended."}
                            </p>
                        </div>

                        {/* AI SUMMARY */}
                        <div className="flex-1 flex flex-col bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden min-h-64 sm:min-h-80 lg:min-h-0 transition-colors duration-200">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-[#1e2d45] bg-slate-50/50 dark:bg-[#1a2235] flex items-center gap-3 shrink-0">
                                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800 dark:text-white">AI Contract Summary</span>
                            </div>
                            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                                {contract.aiSummary ? (
                                    <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {contract.aiSummary}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center gap-4 sm:gap-5 py-8 sm:py-10">
                                        <div className="relative">
                                            <div className="absolute -inset-4 bg-blue-100 dark:bg-blue-500/10 rounded-full animate-pulse opacity-50 blur-xl" />
                                            <div className="bg-white dark:bg-[#1a2235] p-4 rounded-full shadow-sm relative border border-blue-50 dark:border-blue-500/20">
                                                <Loader2 className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400 animate-spin" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-slate-800 dark:text-white mb-1">AI is reading your contract...</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                                                Scanning for hidden risks, obligations, and key terms. This usually takes about 10 seconds.
                                            </p>
                                        </div>
                                        <div className="opacity-60">
                                            <RefreshButton />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
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

function Loader2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}