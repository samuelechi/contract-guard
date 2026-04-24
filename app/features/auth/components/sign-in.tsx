'use client';

import React, { useState } from "react";
import { SignInFlow } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { TriangleAlert } from "lucide-react";
import { useGoogleAuth } from "@/hooks/google-auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SignInCardProps {
    setView: (view: SignInFlow) => void;
}

export const SignInCard = ({ setView }: SignInCardProps) => {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
    const displayError = googleError?.message || emailError;

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.refresh();
            router.push("/dashboard");
        } catch (err: any) {
            setEmailError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-90">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                    Welcome back
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sign in to your ContractGuard account
                </p>
            </div>

            {displayError && (
                <div className="mb-5 flex items-center gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                    <TriangleAlert className="h-4 w-4 shrink-0" />
                    <p>{displayError}</p>
                </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
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

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Password
                    </Label>
                    <Input
                        disabled={isLoading}
                        value={password}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-11 bg-white dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-blue-400 dark:focus-visible:border-blue-500/60 rounded-xl"
                    />
                </div>

                <div className="flex justify-end">
                    <span
                        onClick={() => setView("forgotPassword")}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                        Forgot password?
                    </span>
                </div>

                <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 font-semibold rounded-xl shadow-sm shadow-blue-500/20"
                >
                    {isLoading ? "Signing in..." : "Sign In"}
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
                className="w-full h-11 bg-white dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#212d42] hover:border-slate-300 dark:hover:border-[#263652] font-medium rounded-xl"
            >
                <FcGoogle className="mr-2 h-4 w-4" />
                {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Don't have an account?{" "}
                <span
                    onClick={() => setView("signUp")}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                    Sign up free
                </span>
            </p>
        </div>
    );
};