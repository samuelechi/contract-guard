import Link from "next/link";
import { ShieldCheck, Calendar, Zap, Lock, MessageSquare, FileText, ArrowRight, Play, CheckCircle } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "AI Risk Analysis",
    desc: "Instantly flags dangerous clauses, one-sided terms, and legal landmines buried in your contracts.",
  },
  {
    icon: Calendar,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Deadline Tracking",
    desc: "Never miss a renewal, expiry, or notice period. Get alerts before it's too late.",
  },
  {
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Plain-English Summaries",
    desc: "Understand what you're signing without a law degree. AI breaks down every clause simply.",
  },
  {
    icon: Lock,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Secure Storage",
    desc: "All documents encrypted and stored safely. Access them anywhere, anytime.",
  },
  {
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Chat with AI",
    desc: "Ask questions about your contracts in plain language and get instant, accurate answers.",
  },
  {
    icon: FileText,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Template Library",
    desc: "Download professionally drafted NDAs, freelance contracts, SaaS terms, and more.",
  },
];

const steps = [
  {
    num: "01",
    title: "Upload your contract",
    desc: "Drag & drop any PDF. We support NDAs, service agreements, leases, employment contracts, and more.",
  },
  {
    num: "02",
    title: "AI analyzes instantly",
    desc: "Our model reads every clause, scores risk levels, and extracts key dates and obligations.",
  },
  {
    num: "03",
    title: "Get your full report",
    desc: "Review risk scores, plain-English summaries, deadline alerts, and action items — all in one view.",
  },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export default function LandingPage() {
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
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href}
                className="text-sm font-medium text-[#8A9BB5] hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-medium text-[#8A9BB5] hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] grid grid-cols-1 lg:grid-cols-2">

        {/* Left — text */}
        <div className="relative bg-[#0B0F1A] flex flex-col justify-center px-10 lg:px-16 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e2d45_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-125 h-125 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              AI-Powered Legal Protection
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Never miss a<br />
              <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                risky clause
              </span><br />
              again.
            </h1>

            <p className="text-base text-[#8A9BB5] leading-relaxed mb-8 max-w-md">
              ContractGuard analyzes your legal documents in seconds — surfacing hidden risks, tracking deadlines, and explaining complex terms in plain English.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <Link href="/login"
                className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                Start for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center gap-2 border border-[#263652] text-[#8A9BB5] hover:text-white hover:border-blue-500/50 font-medium px-6 py-3.5 rounded-xl transition-all text-sm">
                <div className="w-6 h-6 rounded-full border border-[#263652] flex items-center justify-center">
                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                </div>
                See how it works
              </a>
            </div>

            <div className="flex items-center gap-6">
              {["No credit card required", "Free to use", "Instant results"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-[#556070] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — photo */}
        <div className="relative hidden lg:block">
          <img
            src="/hero.jpeg"
            alt="Professional reviewing contracts"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0B0F1A]/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0B0F1A]/40 via-transparent to-transparent" />

          <div className="absolute bottom-10 left-10 bg-[#111827]/90 backdrop-blur-sm border border-[#1e2d45] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Analysis Complete</p>
                <p className="text-[10px] text-[#556070] font-mono">just now</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#556070] uppercase tracking-wide font-medium">Risk Score</span>
                <span className="text-xs font-bold text-amber-400 font-mono">55/100</span>
              </div>
              <div className="h-1.5 bg-[#1a2235] rounded-full overflow-hidden w-48">
                <div className="h-full w-[55%] bg-linear-to-r from-amber-500 to-yellow-400 rounded-full" />
              </div>
              <p className="text-[10px] text-[#556070] mt-1">3 clauses need your attention</p>
            </div>
          </div>

          <div className="absolute top-10 right-10 bg-[#111827]/90 backdrop-blur-sm border border-[#1e2d45] rounded-xl px-4 py-3 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Analyzed in 8s</p>
                <p className="text-[10px] text-[#556070]">32 pages scanned</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <div className="bg-[#0f1623] border-y border-[#1e2d45] py-8">
        <div className="max-w-7xl mx-auto px-10">
          <div className="flex items-center justify-center gap-16">
            {[
              { num: "2K", suffix: "+", label: "Contracts Analyzed" },
              { num: "98", suffix: "%", label: "Accuracy Rate" },
              { num: "<10", suffix: "s", label: "Analysis Time" },
              { num: "500", suffix: "+", label: "Happy Users" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-16">
                <div className="text-center">
                  <div className="text-3xl font-extrabold font-mono">
                    <span className="text-white">{stat.num}</span>
                    <span className="text-blue-400">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-[#556070] mt-1 uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </div>
                {i < 3 && <div className="w-px h-10 bg-[#1e2d45]" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            Features
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-lg">
              Everything you need<br />to stay protected
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-md">
              From instant risk detection to deadline reminders, ContractGuard keeps your business legally safe without the lawyer fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title}
                className="group bg-white border border-slate-200 rounded-2xl p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            How It Works
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-16 max-w-lg">
            From upload to insight<br />in seconds
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
            <div className="hidden lg:block absolute top-8 left-[22%] right-[22%] h-px bg-linear-to-r from-blue-200 to-cyan-200" />
            {steps.map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 relative z-10">
                  <span className="text-xl font-extrabold text-white font-mono">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-[#0B0F1A] py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e2d45_1px,transparent_1px)] bg-size-[24px_24px] opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 bg-linear-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-10">
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
            <Link href="/login"
              className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-base">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login"
              className="border border-[#263652] text-[#8A9BB5] hover:text-white hover:border-blue-500/50 font-medium px-7 py-4 rounded-xl transition-all text-base">
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
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="text-xs text-[#556070] hover:text-[#8A9BB5] transition-colors font-medium">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#2d3f56]">© 2026 ContractGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}