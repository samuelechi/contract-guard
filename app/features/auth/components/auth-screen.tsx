"use client";

import { SignInFlow } from "../types";
import { useState } from "react";
import { SignInCard } from "./sign-in";
import { SignUpCard } from "./sign-up";
import { ForgotPasswordCard } from "./forgot-password-card";
import { ShieldCheck, Calendar, Zap, Lock } from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        text: "AI risk analysis in under 10 seconds",
    },
    {
        icon: Calendar,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        text: "Automatic deadline & expiry tracking",
    },
    {
        icon: Zap,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        text: "Plain-English summaries of complex clauses",
    },
    {
        icon: Lock,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        text: "Bank-grade secure document storage",
    },
];

export const AuthScreen = () => {
    const [view, setView] = useState<SignInFlow>("signIn");

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">

            {/* ── LEFT PANEL ── */}
            <div className="relative hidden lg:flex flex-col justify-between bg-[#0B0F1A] px-14 py-12 overflow-hidden">

                {/* Dot pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e2d45_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />

                {/* Blue glow top left */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Cyan glow bottom right */}
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        Contract<span className="text-blue-400">Guard</span>
                    </span>
                </div>

                {/* Hero content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                    <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
                        Protect every<br />
                        agreement with<br />
                        <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            AI precision
                        </span>
                    </h1>
                    <p className="text-[#8A9BB5] text-base leading-relaxed max-w-sm mb-10">
                        Upload any contract and get instant risk analysis, deadline tracking, and AI-powered summaries in seconds.
                    </p>

                    {/* Feature list */}
                    <div className="flex flex-col gap-4 mb-12">
                        {features.map((f) => (
                            <div key={f.text} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${f.bg} flex items-center justify-center shrink-0`}>
                                    <f.icon className={`h-4 w-4 ${f.color}`} />
                                </div>
                                <span className="text-sm font-medium text-[#C8D6E8]">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mock contract card */}
                    <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl p-5 max-w-xs relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-blue-500 to-cyan-400 rounded-t-2xl" />

                        {/* Card header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#C8D6E8] truncate">Paystack_Service_Agreement</p>
                                <p className="text-[10px] text-[#556070] font-mono mt-0.5">Mar 14, 2026</p>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                Completed
                            </span>
                        </div>

                        {/* Risk bar */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-[#556070] font-medium uppercase tracking-wide">Risk Level</span>
                            <span className="text-xs font-bold text-amber-400 font-mono">55/100</span>
                        </div>
                        <div className="h-1.5 bg-[#1a2235] rounded-full overflow-hidden">
                            <div className="h-full w-[55%] bg-linear-to-r from-amber-500 to-yellow-400 rounded-full" />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-4 pt-3 border-t border-[#1e2d45]">
                            <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                View Analysis
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs text-[#2d3f56]">
                    © 2026 ContractGuard. All rights reserved.
                </p>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0f1623] px-8 py-12 transition-colors duration-200">

                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-3 mb-10">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                        Contract<span className="text-blue-600 dark:text-blue-400">Guard</span>
                    </span>
                </div>

                {view === "signIn" && <SignInCard setView={setView} />}
                {view === "signUp" && <SignUpCard setView={setView} />}
                {view === "forgotPassword" && <ForgotPasswordCard setView={setView} />}
            </div>
        </div>
    );
};