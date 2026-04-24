'use client';

import React, { useState } from "react";
import { SignInFlow } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TriangleAlert, CheckCircle2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ForgotPasswordCardProps {
    setView: (view: SignInFlow) => void;
}

export const ForgotPasswordCard = ({ setView }: ForgotPasswordCardProps) => {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-90">

            <button
                onClick={() => setView("signIn")}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                    Reset your password
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            {error && (
                <div className="mb-5 flex items-center gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                    <TriangleAlert className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {success ? (
                <div className="bg-white dark:bg-[#111827] border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email sent!</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Check your inbox at{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>{" "}
                        for the reset link.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            Email
                        </Label>
                        <Input
                            disabled={isLoading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="h-11 bg-white dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-blue-400 dark:focus-visible:border-blue-500/60 rounded-xl"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 font-semibold rounded-xl shadow-sm shadow-blue-500/20"
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            )}
        </div>
    );
};