import { ArrowRight, FileText, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";

interface Contract {
    id: string;
    name: string;
    riskScore: number;
    status: string;
    createdAt: Date | string;
}

export default function RecentContractsPage({ recentContracts }: { recentContracts: Contract[] }) {

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border";
        if (status === "COMPLETED") return (
            <span className={`${base} bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />Completed
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

    const getRiskColor = (score: number) => {
        if (score > 70) return { text: 'text-red-500 dark:text-red-400', bar: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10' };
        if (score > 30) return { text: 'text-amber-500 dark:text-amber-400', bar: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
        return { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentContracts.map((contract) => {
                const risk = getRiskColor(contract.riskScore);
                return (
                    <div
                        key={contract.id}
                        className="group flex flex-col bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-[#263652] rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-sm transition-all duration-200"
                    >
                        {/* Header */}
                        <div className="p-4 pb-3">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={contract.name}>
                                        {contract.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                            {formatDate(contract.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(contract.status)}
                            </div>
                        </div>

                        {/* Risk Score */}
                        <div className="px-4 pb-4 flex-1">
                            <div className={`rounded-lg p-3 border ${contract.status === "COMPLETED"
                                    ? `${risk.bg} border-transparent`
                                    : 'bg-slate-50 dark:bg-[#212d42] border-slate-100 dark:border-[#1e2d45]'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                        Risk Level
                                    </span>
                                    <span className={`text-xs font-bold ${contract.status === "COMPLETED" ? risk.text : 'text-slate-400 dark:text-slate-500'}`}>
                                        {contract.status === "COMPLETED" ? `${contract.riskScore}/100` : "--"}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-[#0B0F1A]/50 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${risk.bar}`}
                                        style={{ width: contract.status === "COMPLETED" ? `${Math.max(contract.riskScore, 2)}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-100 dark:border-[#263652]">
                            <Link
                                href={`/dashboard/contracts/${contract.id}`}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all"
                            >
                                View Analysis
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

