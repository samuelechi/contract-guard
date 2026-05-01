"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShieldCheck, Check, X, ArrowRight, Zap,
    Building2, Users, MessageSquare, FileText,
    Bell, Key, Webhook, HelpCircle, Star
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const plans = [
    {
        id: "free",
        name: "Free",
        desc: "Perfect for individuals exploring AI contract analysis.",
        monthlyPrice: 0,
        annualPrice: 0,
        color: "border-slate-200 dark:border-[#1e2d45]",
        badge: null,
        cta: "Get Started Free",
        ctaStyle: "border border-[#263652] text-[#8A9BB5] hover:text-white hover:border-blue-500/50",
        features: [
            { text: "3 contracts per month", included: true },
            { text: "AI risk scoring", included: true },
            { text: "Plain-English summaries", included: true },
            { text: "Basic deadline tracking", included: true },
            { text: "Template library access", included: true },
            { text: "AI Chat assistant", included: false },
            { text: "Email deadline alerts", included: false },
            { text: "Unlimited contracts", included: false },
            { text: "API access", included: false },
            { text: "Webhook integrations", included: false },
            { text: "Priority support", included: false },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        desc: "For professionals and small teams who rely on contracts daily.",
        monthlyPrice: 19,
        annualPrice: 15,
        color: "border-blue-500 dark:border-blue-500",
        badge: "Most Popular",
        cta: "Start Pro Free",
        ctaStyle: "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20",
        features: [
            { text: "Unlimited contracts", included: true },
            { text: "AI risk scoring", included: true },
            { text: "Plain-English summaries", included: true },
            { text: "Advanced deadline tracking", included: true },
            { text: "Template library access", included: true },
            { text: "AI Chat assistant", included: true },
            { text: "Email deadline alerts", included: true },
            { text: "Export reports (PDF)", included: true },
            { text: "API access", included: false },
            { text: "Webhook integrations", included: false },
            { text: "Priority support", included: false },
        ],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        desc: "For teams and businesses that need full control and integrations.",
        monthlyPrice: 79,
        annualPrice: 63,
        color: "border-slate-200 dark:border-[#1e2d45]",
        badge: null,
        cta: "Contact Sales",
        ctaStyle: "border border-[#263652] text-[#8A9BB5] hover:text-white hover:border-blue-500/50",
        features: [
            { text: "Everything in Pro", included: true },
            { text: "Unlimited contracts", included: true },
            { text: "AI risk scoring", included: true },
            { text: "AI Chat assistant", included: true },
            { text: "Email deadline alerts", included: true },
            { text: "Export reports (PDF)", included: true },
            { text: "API access", included: true },
            { text: "Webhook integrations", included: true },
            { text: "Priority support", included: true },
            { text: "Custom integrations", included: true },
            { text: "Dedicated account manager", included: true },
        ],
    },
];

const faqs = [
    {
        q: "Can I cancel anytime?",
        a: "Yes — cancel anytime with no penalties. You'll keep access until the end of your billing period.",
    },
    {
        q: "What counts as a contract?",
        a: "Any PDF document you upload for analysis counts as one contract, regardless of length.",
    },
    {
        q: "Is my data secure?",
        a: "All documents are encrypted in transit and at rest. We never share your data with third parties.",
    },
    {
        q: "Do you offer refunds?",
        a: "We offer a full refund within 7 days of your first payment if you're not satisfied.",
    },
    {
        q: "What AI model powers ContractGuard?",
        a: "We use the latest OpenAI models fine-tuned for legal document analysis, giving you fast and accurate results.",
    },
    {
        q: "Can I upgrade or downgrade?",
        a: "Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PricingPage() {
    const [annual, setAnnual] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ── NAVBAR ── */}
            <nav className="sticky top-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-[#1e2d45]">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-tight">
                            Contract<span className="text-blue-400">Guard</span>
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-sm font-medium text-[#8A9BB5] hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="text-sm font-medium text-white transition-colors">Pricing</Link>
                        <Link href="/#how-it-works" className="text-sm font-medium text-[#8A9BB5] hover:text-white transition-colors">How It Works</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm font-medium text-[#8A9BB5] hover:text-white transition-colors px-4 py-2">Sign In</Link>
                        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="relative bg-[#0B0F1A] py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#1e2d45_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-linear-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Simple, Transparent Pricing
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-5">
                        Protect your contracts.<br />
                        <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Not your budget.
                        </span>
                    </h1>
                    <p className="text-[#8A9BB5] text-base leading-relaxed mb-10 max-w-lg mx-auto">
                        Start free, upgrade when you're ready. No hidden fees, no surprises.
                    </p>

                    {/* Billing toggle */}
                    <div className="inline-flex items-center gap-3 bg-[#111827] border border-[#1e2d45] rounded-xl p-1">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!annual ? 'bg-blue-600 text-white shadow-sm' : 'text-[#8A9BB5] hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-blue-600 text-white shadow-sm' : 'text-[#8A9BB5] hover:text-white'}`}
                        >
                            Annual
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── PRICING CARDS ── */}
            <section className="bg-[#0B0F1A] pb-24 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-[#111827] rounded-2xl border-2 ${plan.color} p-8 flex flex-col transition-all duration-200 ${plan.id === 'pro' ? 'shadow-2xl shadow-blue-500/10 scale-[1.02]' : ''}`}
                        >
                            {/* Popular badge */}
                            {plan.badge && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-blue-500/30">
                                        <Star className="h-3 w-3 fill-current" />
                                        {plan.badge}
                                    </div>
                                </div>
                            )}

                            {/* Plan header */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-sm text-[#556070] leading-relaxed">{plan.desc}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                <div className="flex items-end gap-1">
                                    <span className="text-5xl font-extrabold text-white font-mono">
                                        ${annual ? plan.annualPrice : plan.monthlyPrice}
                                    </span>
                                    <span className="text-[#556070] text-sm mb-2">/mo</span>
                                </div>
                                {annual && plan.monthlyPrice > 0 && (
                                    <p className="text-xs text-emerald-400 font-medium mt-1">
                                        Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year
                                    </p>
                                )}
                                {plan.monthlyPrice === 0 && (
                                    <p className="text-xs text-[#556070] mt-1">Free forever</p>
                                )}
                            </div>

                            {/* CTA */}
                            <Link
                                href="/login"
                                className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all mb-8 block ${plan.ctaStyle}`}
                            >
                                {plan.cta}
                            </Link>

                            {/* Features */}
                            <div className="space-y-3 flex-1">
                                <p className="text-[10px] font-semibold text-[#556070] uppercase tracking-widest mb-4">
                                    {plan.id === 'enterprise' ? "Everything in Pro, plus:" : "What's included:"}
                                </p>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {feature.included ? (
                                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 text-blue-400" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                                <X className="h-3 w-3 text-[#2d3f56]" />
                                            </div>
                                        )}
                                        <span className={`text-sm ${feature.included ? 'text-[#8A9BB5]' : 'text-[#2d3f56]'}`}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURE COMPARISON ── */}
            <section className="bg-white py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                        Compare Plans
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-14">
                        Everything side by side
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-4 pr-8 text-sm font-semibold text-slate-500 w-1/2">Feature</th>
                                    {plans.map(p => (
                                        <th key={p.id} className="text-center py-4 px-4 text-sm font-bold text-slate-900 w-1/6">
                                            {p.name}
                                            {p.badge && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">{p.badge}</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { label: "Contracts per month", values: ["3", "Unlimited", "Unlimited"] },
                                    { label: "AI risk scoring", values: [true, true, true] },
                                    { label: "Plain-English summaries", values: [true, true, true] },
                                    { label: "Deadline tracking", values: ["Basic", "Advanced", "Advanced"] },
                                    { label: "Template library", values: [true, true, true] },
                                    { label: "AI Chat assistant", values: [false, true, true] },
                                    { label: "Email alerts", values: [false, true, true] },
                                    { label: "PDF export", values: [false, true, true] },
                                    { label: "API access", values: [false, false, true] },
                                    { label: "Webhooks", values: [false, false, true] },
                                    { label: "Priority support", values: [false, false, true] },
                                    { label: "Dedicated account manager", values: [false, false, true] },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 pr-8 text-sm text-slate-600 font-medium">{row.label}</td>
                                        {row.values.map((val, j) => (
                                            <td key={j} className="py-4 px-4 text-center">
                                                {typeof val === 'boolean' ? (
                                                    val
                                                        ? <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mx-auto"><Check className="h-3.5 w-3.5 text-blue-600" /></div>
                                                        : <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mx-auto"><X className="h-3.5 w-3.5 text-slate-300" /></div>
                                                ) : (
                                                    <span className="text-sm font-semibold text-slate-700">{val}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── SOCIAL PROOF ── */}
            <div className="bg-[#0f1623] border-y border-[#1e2d45] py-8">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
                        {[
                            { num: "2K", suffix: "+", label: "Contracts Analyzed" },
                            { num: "98", suffix: "%", label: "Accuracy Rate" },
                            { num: "<10", suffix: "s", label: "Analysis Time" },
                            { num: "500", suffix: "+", label: "Happy Users" },
                        ].map((stat, i, arr) => (
                            <div key={stat.label} className="flex items-center gap-8 sm:gap-16">
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold font-mono">
                                        <span className="text-white">{stat.num}</span>
                                        <span className="text-blue-400">{stat.suffix}</span>
                                    </div>
                                    <div className="text-xs text-[#556070] mt-1 uppercase tracking-wider font-medium">{stat.label}</div>
                                </div>
                                {i < arr.length - 1 && <div className="hidden sm:block w-px h-10 bg-[#1e2d45]" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FAQ ── */}
            <section className="bg-slate-50 py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                        FAQ
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-12">
                        Frequently asked questions
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                                    <HelpCircle className={`h-4 w-4 shrink-0 transition-colors ${openFaq === i ? 'text-blue-600' : 'text-slate-400'}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 border-t border-slate-100">
                                        <p className="text-sm text-slate-500 leading-relaxed pt-4">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative bg-[#0B0F1A] py-28 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#1e2d45_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-linear-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
                <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
                    <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
                        Start protecting your<br />
                        <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            contracts today.
                        </span>
                    </h2>
                    <p className="text-[#8A9BB5] text-base mb-10">
                        Free to use. No credit card required. Takes 30 seconds to get started.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/login" className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-base">
                            Get Started Free
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/login" className="border border-[#263652] text-[#8A9BB5] hover:text-white hover:border-blue-500/50 font-medium px-7 py-4 rounded-xl transition-all text-base">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-[#0B0F1A] border-t border-[#1e2d45] py-8">
                <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <ShieldCheck className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white">
                            Contract<span className="text-blue-400">Guard</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-8">
                        {["Features", "Pricing", "Privacy", "Terms"].map((item) => (
                            <Link key={item} href={item === "Pricing" ? "/pricing" : "#"} className="text-xs text-[#556070] hover:text-[#8A9BB5] transition-colors font-medium">
                                {item}
                            </Link>
                        ))}
                    </div>
                    <p className="text-xs text-[#2d3f56]">© 2026 ContractGuard. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}