import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, TrendingUp, FileCheck, AlertTriangle } from "lucide-react";
import RiskChart from "./risk-chart";

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) redirect("/dashboard");

    // Fetch actual contract data for analytics
    const contracts = await prisma.contract.findMany({
        where: { userId: dbUser.id, status: "COMPLETED" },
        select: { riskScore: true, createdAt: true, name: true }
    });

    // Calculate Stats
    const totalProcessed = contracts.length;
    const highRisk = contracts.filter(c => c.riskScore > 70).length;
    const medRisk = contracts.filter(c => c.riskScore > 30 && c.riskScore <= 70).length;
    const lowRisk = contracts.filter(c => c.riskScore <= 30).length;

    const avgRisk = totalProcessed > 0
        ? Math.round(contracts.reduce((acc, c) => acc + c.riskScore, 0) / totalProcessed)
        : 0;

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Risk Analytics</h1>
                <p className="text-slate-500 mt-1">Deep insights into your legal document health and risk trends.</p>
            </div>

            {/* QUICK STATS */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Avg Risk Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{avgRisk}%</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Safe Documents</CardTitle>
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{lowRisk}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Medium Risk</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{medRisk}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase">High Risk</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{highRisk}</div>
                    </CardContent>
                </Card>
            </div>

            {/* THE CHART COMPONENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <Card className="shadow-sm border-slate-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Risk Distribution</CardTitle>
                        <CardDescription>Breakdown of contract safety levels across your database.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <RiskChart data={contracts} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 bg-white flex flex-col justify-center items-center p-8 text-center">
                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI Insight</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">
                        {avgRisk > 50
                            ? "Your average risk score is higher than normal. We recommend reviewing your 'High Risk' folder immediately."
                            : "Your legal health looks great! Most of your documents are well within standard safety parameters."}
                    </p>
                </Card>
            </div>
        </div>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
    );
}