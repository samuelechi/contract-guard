"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
    Send, Bot, User, FileText, ChevronDown,
    Sparkles, AlertTriangle, X, Loader2, ShieldAlert,
    MessageSquare, Plus
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contract {
    id: string;
    name: string;
    riskScore: number;
    status: string;
    aiSummary?: string | null;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Props {
    contracts: Contract[];
}

// ─── Suggested prompts ────────────────────────────────────────────────────────
const CONTRACT_PROMPTS = [
    "What are the highest risk clauses in this contract?",
    "Summarize the key obligations for each party",
    "Are there any unusual or concerning terms?",
    "What are the termination conditions?",
    "Explain the liability and indemnification clauses",
];

const GENERAL_PROMPTS = [
    "What makes a contract legally binding?",
    "What is an NDA and when do I need one?",
    "What clauses should I always negotiate?",
    "Explain the difference between liability and indemnity",
    "What is force majeure and why does it matter?",
];

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderMessage(content: string) {
    const lines = content.split('\n');
    return lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-sm font-semibold text-slate-800 dark:text-slate-200 my-0.5">{line.slice(2, -2)}</p>;
        if (line.startsWith('- ') || line.startsWith('• ')) return (
            <div key={i} className="flex items-start gap-2 my-0.5">
                <span className="text-blue-500 dark:text-blue-400 mt-1 shrink-0">•</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{line.slice(2)}</span>
            </div>
        );
        if (line.match(/^\d+\. /)) return (
            <div key={i} className="flex items-start gap-2 my-0.5">
                <span className="text-blue-500 dark:text-blue-400 shrink-0 text-sm font-mono">{line.match(/^\d+/)?.[0]}.</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{line.replace(/^\d+\. /, '')}</span>
            </div>
        );
        if (line === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{line}</p>;
    });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatClient({ contracts }: Props) {
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [contractDropdownOpen, setContractDropdownOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const prompts = selectedContract ? CONTRACT_PROMPTS : GENERAL_PROMPTS;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (content: string) => {
        if (!content.trim() || isStreaming) return;
        setError(null);
        setInput('');

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);

        // Placeholder assistant message for streaming
        const assistantId = crypto.randomUUID();
        setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        }]);

        setIsStreaming(true);
        abortRef.current = new AbortController();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortRef.current.signal,
                body: JSON.stringify({
                    contractId: selectedContract?.id ?? null,
                    messages: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!res.ok) throw new Error('Failed to get response');

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No response body');

            let accumulated = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setMessages(prev => prev.map(m =>
                    m.id === assistantId ? { ...m, content: accumulated } : m
                ));
            }
        } catch (e: any) {
            if (e.name === 'AbortError') return;
            setError('Something went wrong. Please try again.');
            setMessages(prev => prev.filter(m => m.id !== assistantId));
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    const handleNewChat = () => {
        abortRef.current?.abort();
        setMessages([]);
        setError(null);
        setInput('');
    };

    const getRiskColor = (score: number) => {
        if (score > 70) return 'text-red-500 dark:text-red-400';
        if (score > 30) return 'text-amber-500 dark:text-amber-400';
        return 'text-emerald-500 dark:text-emerald-400';
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* TOPBAR */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1e2d45] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                                ContractGuard AI
                            </h1>
                            <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">Legal AI Assistant</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <ThemeToggle />
                    <button
                        onClick={handleNewChat}
                        className="h-9 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-[#263652] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-400 dark:hover:border-blue-500/50 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">New Chat</span>
                    </button>
                </div>
            </div>

            {/* CONTRACT SELECTOR */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-[#1e2d45] bg-white dark:bg-[#0B0F1A] shrink-0">
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        <button
                            onClick={() => setContractDropdownOpen(!contractDropdownOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm transition-all ${selectedContract
                                    ? 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5'
                                    : 'border-slate-200 dark:border-[#263652] bg-slate-50 dark:bg-[#111827] hover:border-blue-300 dark:hover:border-blue-500/40'
                                }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedContract ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-slate-200 dark:bg-[#1a2235]'}`}>
                                    <FileText className={`h-3.5 w-3.5 ${selectedContract ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                </div>
                                <div className="min-w-0 text-left">
                                    <p className={`text-xs font-medium truncate ${selectedContract ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {selectedContract ? 'Chatting about' : 'Select a contract or chat generally'}
                                    </p>
                                    {selectedContract && (
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedContract.name}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {selectedContract && (
                                    <span className={`text-xs font-bold ${getRiskColor(selectedContract.riskScore)}`}>
                                        {selectedContract.riskScore}/100
                                    </span>
                                )}
                                {selectedContract ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedContract(null); handleNewChat(); }}
                                        className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#263652] flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                    >
                                        <X className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    </button>
                                ) : (
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${contractDropdownOpen ? 'rotate-180' : ''}`} />
                                )}
                            </div>
                        </button>

                        {/* Dropdown */}
                        {contractDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-xl shadow-xl z-20 overflow-hidden">
                                <div className="p-2">
                                    <button
                                        onClick={() => { setSelectedContract(null); setContractDropdownOpen(false); handleNewChat(); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a2235] transition-colors text-left"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1a2235] flex items-center justify-center">
                                            <MessageSquare className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">General Legal Assistant</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Ask anything about contracts and legal topics</p>
                                        </div>
                                    </button>
                                </div>
                                {contracts.length > 0 && (
                                    <>
                                        <div className="px-4 py-1.5 border-t border-slate-100 dark:border-[#1e2d45]">
                                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Contracts</p>
                                        </div>
                                        <div className="p-2 max-h-56 overflow-y-auto space-y-0.5">
                                            {contracts.map(contract => (
                                                <button
                                                    key={contract.id}
                                                    onClick={() => { setSelectedContract(contract); setContractDropdownOpen(false); handleNewChat(); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a2235] transition-colors text-left"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                                        <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{contract.name}</p>
                                                        <p className={`text-xs font-medium ${getRiskColor(contract.riskScore)}`}>Risk: {contract.riskScore}/100</p>
                                                    </div>
                                                    {contract.riskScore > 70 && (
                                                        <ShieldAlert className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6" onClick={() => setContractDropdownOpen(false)}>
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -inset-2 bg-blue-500/10 rounded-3xl -z-10 blur-xl" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {selectedContract ? `Ask about "${selectedContract.name}"` : 'ContractGuard AI'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                                {selectedContract
                                    ? `I have full context on this contract. Ask me anything about its risks, clauses, or obligations.`
                                    : 'Ask me anything about contracts, legal terms, or upload a contract to analyze it together.'}
                            </p>

                            {/* Suggested prompts */}
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                                {prompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(prompt)}
                                        className="text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-[#263652] bg-white dark:bg-[#111827] hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-[#1a2235] text-slate-600 dark:text-slate-400'
                                }`}>
                                {msg.role === 'user'
                                    ? <User className="h-4 w-4" />
                                    : <Bot className="h-4 w-4" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-tl-sm'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    ) : msg.content === '' ? (
                                        <div className="flex items-center gap-2 py-1">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5">{renderMessage(msg.content)}</div>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* INPUT */}
            <div className="border-t border-slate-200 dark:border-[#1e2d45] bg-white dark:bg-[#0B0F1A] px-4 sm:px-6 py-4 shrink-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45] rounded-2xl px-4 py-3 focus-within:border-blue-400 dark:focus-within:border-blue-500/50 transition-colors">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedContract ? `Ask about "${selectedContract.name}"...` : "Ask anything about contracts..."}
                            rows={1}
                            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none leading-relaxed"
                            style={{ maxHeight: '120px' }}
                            disabled={isStreaming}
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isStreaming}
                            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-[#1a2235] disabled:cursor-not-allowed text-white disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center justify-center transition-all shrink-0"
                        >
                            {isStreaming
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-2">
                        ContractGuard AI is not a licensed attorney. Do not rely on this as legal advice.
                    </p>
                </div>
            </div>
        </div>
    );
}