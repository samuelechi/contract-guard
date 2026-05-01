'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { reanalyzeContract } from './reanalyze-action'; // adjust path if needed
import { useRouter } from 'next/navigation';

interface Props {
    contractId: string;
    status: string;
}

export default function ReanalyzeButton({ contractId, status }: Props) {
    const [pending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
    const router = useRouter();

    const handleReanalyze = () => {
        if (!confirm('This will reset the current analysis and re-run AI on your contract. Continue?')) return;
        setResult(null);

        startTransition(async () => {
            const res = await reanalyzeContract(contractId);
            setResult(res);
            if (res.success) {
                // Refresh page after short delay so status checker picks up
                setTimeout(() => router.refresh(), 1000);
            }
        });
    };

    // Only show for COMPLETED or FAILED contracts
    if (status === 'ANALYZING' || status === 'PENDING_REVIEW') return null;

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handleReanalyze}
                disabled={pending}
                className={`flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-medium transition-all ${pending
                    ? 'border-slate-200 dark:border-[#263652] text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'border-slate-200 dark:border-[#263652] text-slate-600 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5'
                    }`}
            >
                <RefreshCw className={`h-3.5 w-3.5 ${pending ? 'animate-spin' : ''}`} />
                {pending ? 'Analyzing…' : 'Re-analyze'}
            </button>

            {result && !result.success && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {result.error || 'Re-analysis failed'}
                </div>
            )}

            {result?.success && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Analysis complete
                </div>
            )}
        </div>
    );
}