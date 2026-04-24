"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Briefcase, Code, Building, Shield, Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = ["All", "General", "Employment", "Technology", "Compliance"];

// ADDED: fileUrl to point to the public folder
const templates = [
    {
        id: "mutual-nda",
        title: "Mutual NDA",
        description: "Protect confidential information shared between two parties exploring a partnership.",
        icon: Shield,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        category: "General",
        fileUrl: "/templates/mutual-nda.pdf",
    },
    {
        id: "saas-tos",
        title: "SaaS Terms of Service",
        description: "Comprehensive terms for cloud software, including licensing and liability clauses.",
        icon: Code,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        category: "Technology",
        fileUrl: "/templates/saas-tos.pdf",
    },
    {
        id: "freelance-contract",
        title: "Freelance Agreement",
        description: "Clear terms for independent contractors regarding ownership and payment.",
        icon: Briefcase,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        category: "Employment",
        fileUrl: "/templates/freelance-contract.pdf",
    },
    {
        id: "commercial-lease",
        title: "Commercial Lease",
        description: "Legal framework for leasing business property or office spaces.",
        icon: Building,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        category: "General",
        fileUrl: "/templates/commercial-lease.pdf",
    },
    {
        id: "employee-offer",
        title: "Offer Letter",
        description: "Standard employment offer covering base salary, benefits, and at-will terms.",
        icon: FileText,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        category: "Employment",
        fileUrl: "/templates/employee-offer.pdf",
    },
    {
        id: "dpa",
        title: "Data Processing (DPA)",
        description: "Ensure GDPR compliance when handling third-party customer data.",
        icon: Shield,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
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
        <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10 space-y-8 bg-white/50">

            {/* --- HEADER --- */}
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Template Library</h1>
                <p className="text-slate-500 text-lg">Professionally drafted legal starting points for your business.</p>
            </div>

            {/* --- SEARCH & FILTER BAR --- */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === cat
                                ? "bg-slate-900 text-white shadow-md"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search templates..."
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* --- GRID --- */}
            {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <Card key={template.id} className="group flex flex-col h-full border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${template.bgColor} ${template.color} shrink-0`}>
                                        <template.icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-bold group-hover:text-blue-600 transition-colors">
                                            {template.title}
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border-slate-200">
                                            {template.category}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <CardDescription className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                                    {template.description}
                                </CardDescription>
                            </CardContent>

                            <div className="p-4 pt-0 mt-auto grid grid-cols-2 gap-3">
                                {/* FIXED: Preview Button opens the PDF in a new tab */}
                                <Button variant="secondary" size="sm" asChild className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold border-0 cursor-pointer">
                                    <a href={template.fileUrl} target="_blank" rel="noopener noreferrer">
                                        Preview
                                    </a>
                                </Button>

                                {/* FIXED: Download Button actually downloads the file */}
                                <Button size="sm" asChild className="bg-slate-900 hover:bg-blue-600 font-semibold shadow-sm transition-colors cursor-pointer">
                                    <a href={template.fileUrl} download={`${template.id}.pdf`}>
                                        <Download className="mr-2 h-3.5 w-3.5" /> Download
                                    </a>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <LayoutGrid className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">No templates found</h3>
                    <p className="text-slate-500">Try adjusting your search or category filters.</p>
                </div>
            )}
        </div>
    );
}