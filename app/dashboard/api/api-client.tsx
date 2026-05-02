"use client";

import { useState, useTransition } from "react";
import {
    Key, Plus, Trash2, Copy, Check, Eye, EyeOff,
    BookOpen, Loader2, AlertTriangle, ChevronDown,
    ChevronRight, Zap, Lock, ArrowLeft, Webhook,
    ToggleLeft, ToggleRight, Play, Globe, CheckCircle2
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createApiKey, deleteApiKey } from "./actions";
import { createWebhook, deleteWebhook, toggleWebhook, testWebhook } from "./webhook-actions";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiKey {
    id: string;
    label: string;
    keyPreview: string;
    lastUsedAt: Date | null;
    createdAt: Date;
}

interface WebhookItem {
    id: string;
    label: string;
    url: string;
    events: string[];
    isActive: boolean;
    lastFiredAt: Date | null;
    lastStatus: number | null;
    createdAt: Date;
}

interface Props {
    initialApiKeys: ApiKey[];
    initialWebhooks: WebhookItem[];
}

type Tab = "keys" | "webhooks" | "docs" | "zapier";

const WEBHOOK_EVENTS = [
    { id: 'contract.analyzed', label: 'Contract Analyzed', desc: 'Fires when AI analysis completes' },
    { id: 'contract.high_risk', label: 'High Risk Detected', desc: 'Fires when risk score exceeds 70' },
    { id: 'contract.expiring', label: 'Contract Expiring', desc: 'Fires 30 days before expiration' },
    { id: 'contract.failed', label: 'Analysis Failed', desc: 'Fires when analysis fails' },
];

// ─── Code examples ────────────────────────────────────────────────────────────
const codeExamples = {
    listContracts: `curl -X GET \\\n  https://contract-guard-seven.vercel.app/api/v1/contracts \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    getContract: `curl -X GET \\\n  https://contract-guard-seven.vercel.app/api/v1/contracts/CONTRACT_ID \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    getSummary: `curl -X GET \\\n  https://contract-guard-seven.vercel.app/api/v1/contracts/CONTRACT_ID/summary \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    jsExample: `const response = await fetch(\n  'https://contract-guard-seven.vercel.app/api/v1/contracts',\n  {\n    headers: {\n      'Authorization': \`Bearer \${YOUR_API_KEY}\`\n    }\n  }\n);\nconst { contracts } = await response.json();`,
    webhookPayload: `{\n  "event": "contract.analyzed",\n  "timestamp": "2026-01-15T10:30:00Z",\n  "data": {\n    "contractId": "uuid",\n    "name": "Service Agreement.pdf",\n    "riskScore": 72,\n    "status": "COMPLETED",\n    "expirationDate": "2027-01-15"\n  }\n}`,
    responseExample: `{\n  "success": true,\n  "contracts": [\n    {\n      "id": "uuid",\n      "name": "Service Agreement.pdf",\n      "status": "COMPLETED",\n      "riskScore": 72,\n      "createdAt": "2026-01-15T10:30:00Z",\n      "expirationDate": "2027-01-15T00:00:00Z"\n    }\n  ],\n  "pagination": {\n    "total": 12,\n    "page": 1,\n    "limit": 20,\n    "totalPages": 1\n  }\n}`,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#263652] transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
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
            <pre className="p-4 bg-slate-50 dark:bg-[#0f1825] overflow-x-auto text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre">{code}</pre>
        </div>
    );
}

function EndpointCard({ method, path, desc, code, response }: { method: string; path: string; desc: string; code: string; response?: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-200 dark:border-[#1e2d45] rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1a2235] transition-colors text-left">
                <span className="text-xs font-bold px-2 py-1 rounded-md shrink-0 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">{method}</span>
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
export default function ApiClient({ initialApiKeys, initialWebhooks }: Props) {
    const [tab, setTab] = useState<Tab>("keys");

    // API Keys state
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
    const [showNewKey, setShowNewKey] = useState(true);
    const [createKeyPending, startCreateKeyTransition] = useTransition();
    const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
    const [keyError, setKeyError] = useState<string | null>(null);

    // Webhook state
    const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks);
    const [newWebhookLabel, setNewWebhookLabel] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
    const [createWebhookPending, startCreateWebhookTransition] = useTransition();
    const [webhookError, setWebhookError] = useState<string | null>(null);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ id: string; success: boolean; status?: number } | null>(null);
    const [deletingWebhookId, setDeletingWebhookId] = useState<string | null>(null);

    const inputClass = "h-10 bg-slate-50 dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400 dark:focus:border-blue-500/50 focus:ring-0 transition-colors";

    // ── API Key handlers ──
    const handleCreateKey = () => {
        if (!newKeyLabel.trim()) return;
        setKeyError(null);
        startCreateKeyTransition(async () => {
            const result = await createApiKey(newKeyLabel.trim());
            if (result.success && result.key) {
                setNewKeyValue(result.key);
                setNewKeyLabel('');
                window.location.reload();
            } else {
                setKeyError(result.error || 'Failed to create API key');
            }
        });
    };

    const handleDeleteKey = async (id: string) => {
        if (!confirm('Delete this API key? Any apps using it will stop working.')) return;
        setDeletingKeyId(id);
        const result = await deleteApiKey(id);
        if (result.success) setApiKeys(prev => prev.filter(k => k.id !== id));
        else setKeyError(result.error || 'Failed to delete');
        setDeletingKeyId(null);
    };

    // ── Webhook handlers ──
    const handleCreateWebhook = () => {
        setWebhookError(null);
        startCreateWebhookTransition(async () => {
            const result = await createWebhook(newWebhookLabel, newWebhookUrl, newWebhookEvents);
            if (result.success) {
                setNewWebhookLabel(''); setNewWebhookUrl(''); setNewWebhookEvents([]);
                window.location.reload();
            } else {
                setWebhookError(result.error || 'Failed to create webhook');
            }
        });
    };

    const handleDeleteWebhook = async (id: string) => {
        if (!confirm('Delete this webhook?')) return;
        setDeletingWebhookId(id);
        const result = await deleteWebhook(id);
        if (result.success) setWebhooks(prev => prev.filter(w => w.id !== id));
        setDeletingWebhookId(null);
    };

    const handleToggleWebhook = async (id: string, current: boolean) => {
        await toggleWebhook(id, !current);
        setWebhooks(prev => prev.map(w => w.id === id ? { ...w, isActive: !current } : w));
    };

    const handleTestWebhook = async (id: string) => {
        setTestingId(id);
        setTestResult(null);
        const result = await testWebhook(id);
        setTestResult({ id, ...result });
        setTestingId(null);
    };

    const tabs = [
        { id: 'keys' as Tab, label: 'API Keys', icon: Key },
        { id: 'webhooks' as Tab, label: 'Webhooks', icon: Webhook },
        { id: 'docs' as Tab, label: 'Docs', icon: BookOpen },
        { id: 'zapier' as Tab, label: 'Zapier', icon: Zap },
    ];

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
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">Manage API keys, webhooks, and integrations</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

                {/* TABS */}
                <div className="flex items-center gap-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-xl p-1 overflow-x-auto">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{label}
                        </button>
                    ))}
                </div>

                {/* ── API KEYS TAB ── */}
                {tab === 'keys' && (
                    <div className="space-y-5">
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Keep your API keys secret</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Never expose them in client-side code or public repos. Each key is shown only once.</p>
                            </div>
                        </div>

                        {newKeyValue && (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">API key created — copy it now!</p>
                                </div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">This key will not be shown again.</p>
                                <div className="flex items-center gap-2 bg-white dark:bg-[#0f1825] border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-3 py-2">
                                    <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{showNewKey ? newKeyValue : '•'.repeat(40)}</code>
                                    <button onClick={() => setShowNewKey(!showNewKey)} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    <CopyButton text={newKeyValue} />
                                </div>
                                <button onClick={() => setNewKeyValue(null)} className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">I've saved my key</button>
                            </div>
                        )}

                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Create New API Key</h2>
                            <div className="flex gap-3">
                                <Input className={`${inputClass} flex-1`} placeholder="e.g. Production App, Zapier Integration"
                                    value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()} disabled={createKeyPending} />
                                <Button onClick={handleCreateKey} disabled={createKeyPending || !newKeyLabel.trim()} className="bg-blue-600 hover:bg-blue-700 text-white border-0 shrink-0">
                                    {createKeyPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" />Generate</>}
                                </Button>
                            </div>
                            {keyError && <div className="flex items-center gap-2 mt-3 text-xs text-red-500 dark:text-red-400"><AlertTriangle className="h-3.5 w-3.5" />{keyError}</div>}
                        </div>

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
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">{key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteKey(key.id)} disabled={deletingKeyId === key.id}
                                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors inline-flex items-center justify-center">
                                                {deletingKeyId === key.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── WEBHOOKS TAB ── */}
                {tab === 'webhooks' && (
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Add New Webhook</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input className={inputClass} placeholder="Label e.g. Slack Notifications"
                                    value={newWebhookLabel} onChange={(e) => setNewWebhookLabel(e.target.value)} />
                                <Input className={inputClass} placeholder="https://your-endpoint.com/webhook"
                                    value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Trigger Events</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {WEBHOOK_EVENTS.map((event) => (
                                        <label key={event.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${newWebhookEvents.includes(event.id) ? 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5' : 'border-slate-200 dark:border-[#263652] hover:border-blue-200 dark:hover:border-blue-500/20'}`}>
                                            <input type="checkbox" className="mt-0.5 shrink-0 accent-blue-600"
                                                checked={newWebhookEvents.includes(event.id)}
                                                onChange={(e) => setNewWebhookEvents(prev => e.target.checked ? [...prev, event.id] : prev.filter(x => x !== event.id))} />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{event.label}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{event.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {webhookError && <div className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400"><AlertTriangle className="h-3.5 w-3.5" />{webhookError}</div>}
                            <div className="flex justify-end">
                                <Button onClick={handleCreateWebhook} disabled={createWebhookPending || !newWebhookUrl.trim() || !newWebhookLabel.trim() || newWebhookEvents.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                                    {createWebhookPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Add Webhook
                                </Button>
                            </div>
                        </div>

                        {/* Existing webhooks */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-[#1e2d45] flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Your Webhooks</h2>
                                <span className="text-xs text-slate-400 dark:text-slate-500">{webhooks.length}/10</span>
                            </div>
                            {webhooks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-[#1a2235] rounded-2xl flex items-center justify-center mb-3">
                                        <Webhook className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No webhooks yet</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add one above to start receiving events</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-[#1e2d45]">
                                    {webhooks.map((wh) => (
                                        <div key={wh.id} className="px-5 sm:px-6 py-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${wh.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-100 dark:bg-[#1a2235]'}`}>
                                                    <Globe className={`h-4 w-4 ${wh.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{wh.label}</p>
                                                    <code className="text-xs font-mono text-slate-400 dark:text-slate-500 truncate block">{wh.url}</code>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {wh.events.map(e => (
                                                            <span key={e} className="text-[10px] font-mono bg-slate-100 dark:bg-[#1a2235] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{e}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Status */}
                                                    {wh.lastStatus !== null && (
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${wh.lastStatus >= 200 && wh.lastStatus < 300 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                            {wh.lastStatus === 0 ? 'timeout' : wh.lastStatus}
                                                        </span>
                                                    )}
                                                    {/* Toggle */}
                                                    <button onClick={() => handleToggleWebhook(wh.id, wh.isActive)} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        {wh.isActive ? <ToggleRight className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : <ToggleLeft className="h-5 w-5" />}
                                                    </button>
                                                    {/* Test */}
                                                    <button onClick={() => handleTestWebhook(wh.id)} disabled={testingId === wh.id}
                                                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-[#263652] text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors flex items-center gap-1.5">
                                                        {testingId === wh.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                                        Test
                                                    </button>
                                                    {/* Delete */}
                                                    <button onClick={() => handleDeleteWebhook(wh.id)} disabled={deletingWebhookId === wh.id}
                                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors inline-flex items-center justify-center">
                                                        {deletingWebhookId === wh.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Test result */}
                                            {testResult?.id === wh.id && (
                                                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${testResult.success ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                    {testResult.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                                                    {testResult.success ? `Test delivered successfully (${testResult.status})` : `Test failed (status: ${testResult.status})`}
                                                </div>
                                            )}
                                            {wh.lastFiredAt && (
                                                <p className="text-xs text-slate-400 dark:text-slate-500">Last fired: {new Date(wh.lastFiredAt).toLocaleString()}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Payload example */}
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Webhook Payload</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Every webhook POST includes these fields.</p>
                            <CodeBlock code={codeExamples.webhookPayload} />
                        </div>
                    </div>
                )}

                {/* ── DOCS TAB ── */}
                {tab === 'docs' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Base URL</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">All requests must be made over HTTPS.</p>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0f1825] border border-slate-200 dark:border-[#263652] rounded-lg px-4 py-2.5">
                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400 flex-1">https://contract-guard-seven.vercel.app/api/v1</code>
                                <CopyButton text="https://contract-guard-seven.vercel.app/api/v1" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Authentication</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Pass your API key in every request header.</p>
                            <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} />
                        </div>
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-[#1e2d45]">
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Endpoints</h2>
                            </div>
                            <div className="p-4 space-y-3">
                                <EndpointCard method="GET" path="/contracts" desc="List all contracts with pagination" code={codeExamples.listContracts} response={codeExamples.responseExample} />
                                <EndpointCard method="GET" path="/contracts/:id" desc="Get full contract details including AI summary" code={codeExamples.getContract} />
                                <EndpointCard method="GET" path="/contracts/:id/summary" desc="Get just the AI summary and risk score" code={codeExamples.getSummary} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Query Parameters</h2>
                            <div className="space-y-3">
                                {[
                                    { param: 'limit', type: 'integer', desc: 'Results per page (default: 20, max: 100)' },
                                    { param: 'page', type: 'integer', desc: 'Page number (default: 1)' },
                                    { param: 'status', type: 'string', desc: 'Filter by: COMPLETED, ANALYZING, FAILED' },
                                ].map((p) => (
                                    <div key={p.param} className="flex items-start gap-4 py-3 border-b border-slate-100 dark:border-[#1e2d45] last:border-0">
                                        <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0 w-20">{p.param}</code>
                                        <span className="text-xs bg-slate-100 dark:bg-[#1a2235] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono shrink-0">{p.type}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">JavaScript Example</h2>
                            <CodeBlock code={codeExamples.jsExample} />
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Rate Limits</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">100 requests per minute per API key. Exceeding returns a 429 status.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── ZAPIER TAB ── */}
                {tab === 'zapier' && (
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-6 sm:p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Connect ContractGuard to 5,000+ apps</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                                Use Zapier to connect ContractGuard with Slack, Notion, Google Sheets, Gmail, and thousands of other tools — no code required.
                            </p>
                            <a href="https://zapier.com" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                                <Zap className="h-4 w-4" />Connect on Zapier
                            </a>
                        </div>

                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">How to connect</h2>
                            <div className="space-y-4">
                                {[
                                    { num: '1', title: 'Generate an API key', desc: 'Go to the API Keys tab and create a new key labeled "Zapier".' },
                                    { num: '2', title: 'Create a Zap on Zapier', desc: 'Go to zapier.com, click "Create Zap", and choose "Webhooks by Zapier" as your trigger.' },
                                    { num: '3', title: 'Add a webhook in ContractGuard', desc: 'Copy the webhook URL from Zapier and add it in the Webhooks tab. Select the events you want to trigger your Zap.' },
                                    { num: '4', title: 'Set up your Zap action', desc: 'Choose what happens in the connected app — send a Slack message, add a row to Google Sheets, create a Notion page, etc.' },
                                    { num: '5', title: 'Test and activate', desc: 'Use the Test button in the Webhooks tab to send a sample payload to Zapier, then activate your Zap.' },
                                ].map((step) => (
                                    <div key={step.num} className="flex items-start gap-4">
                                        <div className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 text-xs font-bold">
                                            {step.num}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{step.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Popular Zap ideas</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { emoji: '💬', title: 'Slack alert on high risk', desc: 'Get a Slack message whenever a contract scores above 70.' },
                                    { emoji: '📊', title: 'Log to Google Sheets', desc: 'Automatically add every analyzed contract to a spreadsheet.' },
                                    { emoji: '📝', title: 'Create Notion page', desc: 'Create a Notion database entry for each new contract.' },
                                    { emoji: '📧', title: 'Gmail notification', desc: 'Send yourself an email when a contract is about to expire.' },
                                ].map((idea) => (
                                    <div key={idea.title} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#1a2235] border border-slate-100 dark:border-[#263652]">
                                        <span className="text-xl shrink-0">{idea.emoji}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{idea.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{idea.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}