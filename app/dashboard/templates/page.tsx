"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Briefcase, Code, Building, Shield, Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const categories = ["All", "General", "Employment", "Technology", "Compliance"];

const templates = [
    {
        id: "mutual-nda",
        title: "Mutual NDA",
        description: "Protect confidential information shared between two parties exploring a partnership.",
        icon: Shield,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-500/10",
        category: "General",
        fileUrl: "/templates/mutual-nda.pdf",
    },
    {
        id: "saas-tos",
        title: "SaaS Terms of Service",
        description: "Comprehensive terms for cloud software, including licensing and liability clauses.",
        icon: Code,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
        category: "Technology",
        fileUrl: "/templates/saas-tos.pdf",
    },
    {
        id: "freelance-contract",
        title: "Freelance Agreement",
        description: "Clear terms for independent contractors regarding ownership and payment.",
        icon: Briefcase,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
        category: "Employment",
        fileUrl: "/templates/freelance-contract.pdf",
    },
    {
        id: "commercial-lease",
        title: "Commercial Lease",
        description: "Legal framework for leasing business property or office spaces.",
        icon: Building,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-500/10",
        category: "General",
        fileUrl: "/templates/commercial-lease.pdf",
    },
    {
        id: "employee-offer",
        title: "Offer Letter",
        description: "Standard employment offer covering base salary, benefits, and at-will terms.",
        icon: FileText,
        color: "text-rose-600 dark:text-rose-400",
        bgColor: "bg-rose-50 dark:bg-rose-500/10",
        category: "Employment",
        fileUrl: "/templates/employee-offer.pdf",
    },
    {
        id: "dpa",
        title: "Data Processing (DPA)",
        description: "Ensure GDPR compliance when handling third-party customer data.",
        icon: Shield,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
        category: "Compliance",
        fileUrl: "/templates/dpa.pdf",
    }
];

export default function TemplatesPage() {
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTemplates = templates.filter(t =>
        (activeTab === "All" || t.category === activeTab) &&
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 transition-colors duration-200">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0" />
                    <div>
                        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Template Library</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">Professionally drafted legal starting points</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

                {/* SEARCH & FILTER BAR */}
                <div className="flex flex-col gap-3 bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-[#1e2d45] shadow-sm">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === cat
                                        ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md"
                                        : "bg-slate-100 dark:bg-[#1a2235] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#263652]"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder="Search templates..."
                            className="pl-9 bg-slate-50 dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#1a2235] focus:border-blue-400 dark:focus:border-blue-500/50 focus:ring-0 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* GRID */}
                {filteredTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                        {filteredTemplates.map((template) => (
                            <Card key={template.id} className="group flex flex-col h-full bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1e2d45] hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${template.bgColor} ${template.color} shrink-0`}>
                                            <template.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {template.title}
                                            </CardTitle>
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 border-slate-200 dark:border-[#263652]">
                                                {template.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 pb-0">
                                    <CardDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                                        {template.description}
                                    </CardDescription>
                                </CardContent>

                                <div className="p-3 sm:p-4 mt-auto grid grid-cols-2 gap-2 sm:gap-3">
                                    <Button variant="secondary" size="sm" asChild className="bg-slate-100 dark:bg-[#1a2235] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#263652] font-semibold border-0 cursor-pointer text-xs sm:text-sm">
                                        <a href={template.fileUrl} target="_blank" rel="noopener noreferrer">
                                            Preview
                                        </a>
                                    </Button>
                                    <Button size="sm" asChild className="bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors cursor-pointer text-xs sm:text-sm border-0">
                                        <a href={template.fileUrl} download={`${template.id}.pdf`}>
                                            <Download className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Download
                                        </a>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-white dark:bg-[#111827] rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#1e2d45]">
                        <LayoutGrid className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">No templates found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Try adjusting your search or category filters.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveTab('All'); }}
                            className="mt-4 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}