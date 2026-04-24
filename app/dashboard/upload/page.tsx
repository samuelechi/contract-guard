import UploadZone from "../component/upload-zone";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function UploadPage() {
    return (
        <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#0B0F1A] overflow-hidden flex flex-col transition-colors duration-200">

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-6 py-4 flex items-center justify-between transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Upload Contract</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">AI-powered risk analysis</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            {/* DOT PATTERN */}
            <div className="absolute inset-0 -z-10 h-full w-full
                bg-[radial-gradient(#cbd5e1_1px,transparent_1px)]
                dark:bg-[radial-gradient(#1e2d45_1px,transparent_1px)]
                bg-size-[24px_24px] opacity-60"
            />

            {/* TOP GLOW */}
            <div className="absolute top-0 -z-10 right-0 left-0 h-96 w-full bg-linear-to-b from-blue-50/80 dark:from-blue-500/5 to-transparent" />

            {/* CONTENT */}
            <div className="flex-1 flex flex-col items-center pt-16 px-4 pb-20">
                <div className="w-full max-w-2xl">
                    <Button
                        variant="ghost"
                        className="mb-6 -ml-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2235]"
                        asChild
                    >
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard
                        </Link>
                    </Button>

                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                            Analyze a new contract
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            Securely upload your document. Our AI will scan for risks, highlight key terms, and track deadlines.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#111827] p-2 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-[#1e2d45] transition-colors duration-200">
                        <UploadZone />
                    </div>
                </div>
            </div>
        </div>
    );
}