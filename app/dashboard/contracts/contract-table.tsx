"use client"

import * as React from "react"
import { deleteContract } from '@/app/dashboard/actions';
import { Trash2, ArrowLeft, Filter, Plus, ArrowUpDown, Search, FileText, CalendarDays, AlertCircle, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Contract {
    id: string;
    name: string;
    fileUrl: string;
    riskScore: number;
    status: string;
    createdAt?: Date | string;
    aiSummary?: string | null;
    expirationDate?: Date | string | null;
}

export default function ContractTable({ contracts }: { contracts: Contract[] }) {
    const [data, setData] = React.useState<Contract[]>(contracts);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof Contract; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: null });
    const [visibleColumns, setVisibleColumns] = React.useState({
        fileUrl: false,
        riskScore: true,
        status: true,
        expirationDate: true,
    });

    const handleSort = (key: keyof Contract) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        const sorted = [...data].sort((a, b) => {
            const va = a[key] ?? ""; const vb = b[key] ?? "";
            if (va < vb) return direction === 'asc' ? -1 : 1;
            if (va > vb) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setData(sorted);
        setSortConfig({ key, direction });
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border";
        if (status === "COMPLETED") return (
            <span className={`${base} bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />Completed
            </span>
        );
        if (status === "FAILED") return (
            <span className={`${base} bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />Failed
            </span>
        );
        return (
            <span className={`${base} bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 animate-pulse`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />Analyzing...
            </span>
        );
    };

    const getRiskPill = (score: number) => {
        if (score >= 70) return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                <ShieldAlert className="h-3 w-3" />{score}/100
            </span>
        );
        if (score >= 31) return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {score}/100
            </span>
        );
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {score}/100
            </span>
        );
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        const result = await deleteContract(id);
        if (result.success) setData(prev => prev.filter(c => c.id !== id));
        else alert("Failed to delete contract.");
    };

    const getExpirationDisplay = (dateString: Date | string | null | undefined) => {
        if (!dateString) return <span className="text-slate-400 italic text-sm">Not specified</span>;
        const today = new Date();
        const expiry = new Date(dateString);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const formatted = expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (diffDays < 0) return (
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-300">{formatted}</span>
                <span className="text-red-500 dark:text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3" />Expired
                </span>
            </div>
        );
        if (diffDays <= 30) return (
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-300">{formatted}</span>
                <span className="text-amber-500 dark:text-amber-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3" />Expires in {diffDays}d
                </span>
            </div>
        );
        return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatted}</span>;
    };

    const thClass = "text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 h-12 px-4 sm:px-7";
    const sortableClass = "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-4 sm:px-8 py-4 sm:py-5 transition-colors duration-200">
                <Button variant="ghost" size="sm" asChild className="mb-2 sm:mb-3 -ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2235]">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />Back
                    </Link>
                </Button>
                <div className="flex items-start sm:items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Contract Repository</h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1 hidden sm:block">Manage, search, and review all your analyzed documents.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-9 px-3 sm:px-4 shrink-0" asChild>
                        <Link href="/dashboard/upload">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Upload New</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">

                {/* TOOLBAR */}
                <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111827] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d45] shadow-sm dark:shadow-none transition-colors duration-200">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder="Search contracts..."
                            className="pl-9 h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent border-slate-200 dark:border-[#263652] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-blue-500/50 shrink-0">
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline text-sm">Columns</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] p-2">
                            <DropdownMenuLabel className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                                Toggle Columns
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#1e2d45]" />
                            {(['fileUrl', 'riskScore', 'status', 'expirationDate'] as const).map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col}
                                    checked={visibleColumns[col]}
                                    onCheckedChange={(v) => setVisibleColumns(prev => ({ ...prev, [col]: !!v }))}
                                    className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-[#1a2235] focus:text-slate-900 dark:focus:text-white rounded-lg"
                                >
                                    {col === 'fileUrl' ? 'File URL' : col === 'riskScore' ? 'Risk Score' : col === 'status' ? 'Status' : 'Expiration'}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* MOBILE CARD LIST — shown below md */}
                <div className="block md:hidden space-y-3">
                    {filteredData.length > 0 ? filteredData.map((contract) => (
                        <div key={contract.id} className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1e2d45] p-4 space-y-3">
                            {/* Name row */}
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <Link href={`/dashboard/contracts/${contract.id}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1 min-w-0 truncate">
                                    {contract.name}
                                </Link>
                                <button
                                    onClick={() => handleDelete(contract.id)}
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors inline-flex items-center justify-center shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            {/* Meta row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {visibleColumns.status && getStatusBadge(contract.status)}
                                {visibleColumns.riskScore && getRiskPill(contract.riskScore)}
                            </div>
                            {/* Expiration */}
                            {visibleColumns.expirationDate && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                    {getExpirationDisplay(contract.expirationDate)}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e2d45]">
                            <Search className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">No contracts found</h3>
                            <button onClick={() => setSearchTerm("")} className="mt-3 px-4 py-2 rounded-lg border border-slate-200 dark:border-[#263652] text-slate-500 text-sm transition-colors hover:text-slate-900 hover:border-blue-400">
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>

                {/* DESKTOP TABLE — hidden below md */}
                <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e2d45] shadow-sm dark:shadow-none overflow-hidden transition-colors duration-200">
                    <Table>
                        <TableHeader className="border-b border-slate-100 dark:border-[#1e2d45]">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className={thClass}>Document Name</TableHead>
                                {visibleColumns.fileUrl && <TableHead className={thClass}>File URL</TableHead>}
                                {visibleColumns.riskScore && (
                                    <TableHead className={`${thClass} ${sortableClass}`} onClick={() => handleSort('riskScore')}>
                                        <div className="flex items-center gap-1.5">Risk Score <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                                    </TableHead>
                                )}
                                {visibleColumns.status && (
                                    <TableHead className={`${thClass} ${sortableClass}`} onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1.5">Status <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                                    </TableHead>
                                )}
                                {visibleColumns.expirationDate && (
                                    <TableHead className={`${thClass} ${sortableClass}`} onClick={() => handleSort('expirationDate')}>
                                        <div className="flex items-center gap-1.5">Expiration <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                                    </TableHead>
                                )}
                                <TableHead className={`${thClass} text-right`}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? filteredData.map((contract) => (
                                <TableRow key={contract.id} className="border-b border-slate-50 dark:border-[#1e2d45] hover:bg-slate-50/80 dark:hover:bg-[#1a2235]/50 transition-colors">
                                    <TableCell className="px-7 py-4">
                                        <Link href={`/dashboard/contracts/${contract.id}`} className="flex items-center gap-3 group">
                                            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {contract.name}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    {visibleColumns.fileUrl && (
                                        <TableCell className="text-slate-400 font-mono text-xs px-7 max-w-[150px] truncate">{contract.fileUrl}</TableCell>
                                    )}
                                    {visibleColumns.riskScore && <TableCell className="px-7">{getRiskPill(contract.riskScore)}</TableCell>}
                                    {visibleColumns.status && <TableCell className="px-7">{getStatusBadge(contract.status)}</TableCell>}
                                    {visibleColumns.expirationDate && (
                                        <TableCell className="px-7">
                                            <div className="flex items-start gap-2">
                                                <CalendarDays className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                {getExpirationDisplay(contract.expirationDate)}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right px-7">
                                        <button
                                            onClick={() => handleDelete(contract.id)}
                                            className="h-8 w-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors inline-flex items-center justify-center"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-14 h-14 bg-slate-100 dark:bg-[#1a2235] rounded-2xl flex items-center justify-center mb-4">
                                                <Search className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">No contracts found</h3>
                                            <p className="text-slate-400 text-sm max-w-sm mb-5">We couldn't find any contracts matching "{searchTerm}".</p>
                                            <button onClick={() => setSearchTerm("")} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#263652] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-400 dark:hover:border-blue-500/50 text-sm transition-colors">
                                                Clear Search
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}