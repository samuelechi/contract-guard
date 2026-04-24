'use client';

import React, { useState } from "react";
import { SignInFlow } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { TriangleAlert, CheckCircle2 } from "lucide-react";
import { useGoogleAuth } from "@/hooks/google-auth";
import { createClient } from "@/lib/supabase/client";

interface SignUpCardProps {
    setView: (view: SignInFlow) => void;
}

export const SignUpCard = ({ setView }: SignUpCardProps) => {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
    const displayError = googleError?.message || error;

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-90 text-center">
                <div className="bg-white dark:bg-[#111827] border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-10 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        We sent a confirmation link to{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
                    </p>
                    <Button
                        onClick={() => setView("signIn")}
                        variant="outline"
                        className="w-full bg-transparent border-slate-200 dark:border-[#263652] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2235] rounded-xl h-11"
                    >
                        Back to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    const inputClass = "h-11 bg-white dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-blue-400 dark:focus-visible:border-blue-500/60 rounded-xl";
    const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide";

    return (
        <div className="w-full max-w-90">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                    Create your account
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Start protecting your contracts today
                </p>
            </div>

            {displayError && (
                <div className="mb-5 flex items-center gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                    <TriangleAlert className="h-4 w-4 shrink-0" />
                    <p>{displayError}</p>
                </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                    <Label className={labelClass}>Email</Label>
                    <Input disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                    <Label className={labelClass}>Password</Label>
                    <Input disabled={isLoading} value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                    <Label className={labelClass}>Confirm Password</Label>
                    <Input disabled={isLoading} value={confirmPassword} type="password" onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className={inputClass} />
                </div>

                <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 font-semibold rounded-xl shadow-sm shadow-blue-500/20"
                >
                    {isLoading ? "Creating account..." : "Create Account"}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px bg-slate-200 dark:bg-[#1e2d45] flex-1" />
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">or</span>
                <div className="h-px bg-slate-200 dark:bg-[#1e2d45] flex-1" />
            </div>

            <Button
                type="button"
                disabled={googleLoading}
                variant="outline"
                onClick={() => signInWithGoogle()}
                className="w-full h-11 bg-white dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#212d42] font-medium rounded-xl"
            >
                <FcGoogle className="mr-2 h-4 w-4" />
                {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Already have an account?{" "}
                <span onClick={() => setView("signIn")} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Sign in
                </span>
            </p>
        </div>
    );
};