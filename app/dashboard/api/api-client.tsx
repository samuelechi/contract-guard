"use client";

import { useState, useTransition } from "react";
import {
    Key, Plus, Trash2, Copy, Check, Eye, EyeOff,
    Code, BookOpen, Loader2, AlertTriangle, ChevronDown,
    ChevronRight, Terminal, Zap, Lock, ArrowLeft
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createApiKey, deleteApiKey } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiKey {
    id: string;
    label: string;
    keyPreview: string;
    lastUsedAt: Date | null;
    createdAt: Date;
}

interface Props {
    initialApiKeys: ApiKey[];
}

type Tab = "keys" | "docs";

// ─── Code examples ────────────────────────────────────────────────────────────
const codeExamples = {
    listContracts: `curl -X GET \\
  https://contract-guard-seven.vercel.app/api/v1/contracts \\
  -H "Authorization: Bearer YOUR_API_KEY"`,

    getContract: `curl -X GET \\
  https://contract-guard-seven.vercel.app/api/v1/contracts/CONTRACT_ID \\
  -H "Authorization: Bearer YOUR_API_KEY"`,

    getSummary: `curl -X GET \\
  https://contract-guard-seven.vercel.app/api/v1/contracts/CONTRACT_ID/summary \\
  -H "Authorization: Bearer YOUR_API_KEY"`,

    jsExample: `const response = await fetch(
  'https://contract-guard-seven.vercel.app/api/v1/contracts',
  {
    headers: {
      'Authorization': \`Bearer \${YOUR_API_KEY}\`
    }
  }
);
const { contracts } = await response.json();`,

    responseExample: `{
  "success": true,
  "contracts": [
    {
      "id": "uuid",
      "name": "Service Agreement.pdf",
      "status": "COMPLETED",
      "riskScore": 72,
      "createdAt": "2026-01-15T10:30:00Z",
      "expirationDate": "2027-01-15T00:00:00Z",
      "fileUrl": "https://..."
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}`,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#263652] transition-colors">
            {copied
                ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                : <Copy className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
        </button>
    );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
    return (
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#263652]">
            {label && (
                <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-[#1a2235] border-b border-slate-200 dark:border-[#263652]">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
                    <CopyButton text={code} />
                </div>
            )}
            <pre className="p-4 bg-slate-50 dark:bg-[#0f1825] overflow-x-auto text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre">
                {code}
            </pre>
        </div>
    );
}

function EndpointCard({ method, path, desc, code, response }: {
    method: string; path: string; desc: string; code: string; response?: string;
}) {
    const [open, setOpen] = useState(false);
    const methodColor = method === 'GET' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400';

    return (
        <div className="border border-slate-200 dark:border-[#1e2d45] rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1a2235] transition-colors text-left"
            >
                <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${methodColor}`}>{method}</span>
                <code className="text-sm font-mono text-slate-700 dark:text-slate-300 flex-1">{path}</code>
                <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block flex-1">{desc}</span>
                {open ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
            </button>
            {open && (
                <div className="px-5 pb-5 pt-2 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-[#1e2d45] space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
                    <CodeBlock code={code} label="Example Request" />
                    {response && <CodeBlock code={response} label="Example Response" />}
                </div>
            )}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ApiClient({ initialApiKeys }: Props) {
    const [tab, setTab] = useState<Tab>("keys");
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
    const [showNewKey, setShowNewKey] = useState(true);
    const [createPending, startCreateTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = () => {
        if (!newKeyLabel.trim()) return;
        setError(null);
        startCreateTransition(async () => {
            const result = await createApiKey(newKeyLabel.trim());
            if (result.success && result.key) {
                setNewKeyValue(result.key);
                setNewKeyLabel('');
                // Refresh key list
                const res = await fetch('/api/v1/contracts', { method: 'HEAD' }).catch(() => null);
                window.location.reload();
            } else {
                setError(result.error || 'Failed to create API key');
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this API key? Any apps using it will stop working.')) return;
        setDeletingId(id);
        const result = await deleteApiKey(id);
        if (result.success) {
            setApiKeys(prev => prev.filter(k => k.id !== id));
        } else {
            setError(result.error || 'Failed to delete key');
        }
        setDeletingId(null);
    };

    const inputClass = "h-10 bg-slate-50 dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400 dark:focus:border-blue-500/50 focus:ring-0 transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 transition-colors duration-200">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0" />
                    <Button variant="ghost" size="sm" asChild className="-ml-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2235] hidden sm:flex">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />Dashboard
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">API Integrations</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">Manage API keys and explore endpoints</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

                {/* TABS */}
                <div className="flex items-center gap-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-xl p-1 w-fit">
                    {([
                        { id: 'keys', label: 'API Keys', icon: Key },
                        { id: 'docs', label: 'Documentation', icon: BookOpen },
                    ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── API KEYS TAB ── */}
                {tab === 'keys' && (
                    <div className="space-y-5">

                        {/* Info banner */}
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Keep your API keys secret</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                    API keys grant full access to your contracts. Never expose them in client-side code or public repositories. Each key is shown only once on creation.
                                </p>
                            </div>
                        </div>

                        {/* New key shown once */}
                        {newKeyValue && (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">API key created — copy it now!</p>
                                </div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">This key will not be shown again. Store it somewhere safe.</p>
                                <div className="flex items-center gap-2 bg-white dark:bg-[#0f1825] border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-3 py-2">
                                    <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                                        {showNewKey ? newKeyValue : '•'.repeat(40)}
                                    </code>
                                    <button onClick={() => setShowNewKey(!showNewKey)} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    <CopyButton text={newKeyValue} />
                                </div>
                                <button onClick={() => setNewKeyValue(null)} className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                                    I've saved my key
                                </button>
                            </div>
                        )}

                        {/* Create new key */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Create New API Key</h2>
                            <div className="flex gap-3">
                                <Input
                                    className={`${inputClass} flex-1`}
                                    placeholder="e.g. Production App, Zapier Integration"
                                    value={newKeyLabel}
                                    onChange={(e) => setNewKeyLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    disabled={createPending}
                                />
                                <Button
                                    onClick={handleCreate}
                                    disabled={createPending || !newKeyLabel.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 shrink-0"
                                >
                                    {createPending
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <><Plus className="h-4 w-4 mr-2" />Generate</>}
                                </Button>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 mt-3 text-xs text-red-500 dark:text-red-400">
                                    <AlertTriangle className="h-3.5 w-3.5" />{error}
                                </div>
                            )}
                        </div>

                        {/* Existing keys */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-[#1e2d45] flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Your API Keys</h2>
                                <span className="text-xs text-slate-400 dark:text-slate-500">{apiKeys.length}/5 keys</span>
                            </div>

                            {apiKeys.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-[#1a2235] rounded-2xl flex items-center justify-center mb-3">
                                        <Key className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No API keys yet</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create one above to get started</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-[#1e2d45]">
                                    {apiKeys.map((key) => (
                                        <div key={key.id} className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#1a2235] transition-colors">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{key.label}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <code className="text-xs font-mono text-slate-400 dark:text-slate-500">{key.keyPreview}</code>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {key.lastUsedAt
                                                            ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                                                            : 'Never used'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                                                    Created {new Date(key.createdAt).toLocaleDateString()}
                                                </span>
                                                <button
                                                    onClick={() => handleDelete(key.id)}
                                                    disabled={deletingId === key.id}
                                                    className="w-8 h-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors inline-flex items-center justify-center"
                                                >
                                                    {deletingId === key.id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── DOCS TAB ── */}
                {tab === 'docs' && (
                    <div className="space-y-6">

                        {/* Base URL */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Base URL</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">All API requests must be made over HTTPS.</p>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0f1825] border border-slate-200 dark:border-[#263652] rounded-lg px-4 py-2.5">
                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400 flex-1">
                                    https://contract-guard-seven.vercel.app/api/v1
                                </code>
                                <CopyButton text="https://contract-guard-seven.vercel.app/api/v1" />
                            </div>
                        </div>

                        {/* Authentication */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Authentication</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Pass your API key in the Authorization header on every request.</p>
                            <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} />
                        </div>

                        {/* Endpoints */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-[#1e2d45]">
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Endpoints</h2>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Click an endpoint to see example requests and responses</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <EndpointCard
                                    method="GET"
                                    path="/contracts"
                                    desc="List all your contracts with pagination support"
                                    code={codeExamples.listContracts}
                                    response={codeExamples.responseExample}
                                />
                                <EndpointCard
                                    method="GET"
                                    path="/contracts/:id"
                                    desc="Get full details of a single contract including AI summary"
                                    code={codeExamples.getContract}
                                />
                                <EndpointCard
                                    method="GET"
                                    path="/contracts/:id/summary"
                                    desc="Get just the AI summary and risk score for a contract"
                                    code={codeExamples.getSummary}
                                />
                            </div>
                        </div>

                        {/* Query params */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Query Parameters</h2>
                            <div className="space-y-3">
                                {[
                                    { param: 'limit', type: 'integer', desc: 'Number of results per page (default: 20, max: 100)' },
                                    { param: 'page', type: 'integer', desc: 'Page number for pagination (default: 1)' },
                                    { param: 'status', type: 'string', desc: 'Filter by status: COMPLETED, ANALYZING, FAILED' },
                                ].map((p) => (
                                    <div key={p.param} className="flex items-start gap-4 py-3 border-b border-slate-100 dark:border-[#1e2d45] last:border-0">
                                        <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0 w-20">{p.param}</code>
                                        <span className="text-xs bg-slate-100 dark:bg-[#1a2235] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono shrink-0">{p.type}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* JS example */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">JavaScript Example</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Using the Fetch API in Node.js or the browser.</p>
                            <CodeBlock code={codeExamples.jsExample} />
                        </div>

                        {/* Rate limits */}
                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Rate Limits</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                    API requests are limited to 100 requests per minute per API key. Exceeding this will return a 429 status code.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}