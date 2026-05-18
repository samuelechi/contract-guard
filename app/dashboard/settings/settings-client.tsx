"use client";

import { useState, useTransition, useRef } from "react";
import {
    Mail, Lock, Bell, Trash2, Check,
    Eye, EyeOff, AlertTriangle, Shield, ChevronRight,
    Loader2, ArrowLeft, User, Camera, X
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    updateProfile,
    updateEmail,
    updatePassword,
    updateNotifications,
    deleteAccount,
} from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "profile" | "email" | "password" | "notifications" | "danger" | "";

interface NotifPrefs {
    id?: string;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    contractAnalyzed: boolean;
    highRiskDetected: boolean;
    deadlineReminders: boolean;
    marketingEmails: boolean;
}

interface Props {
    initialNotifPrefs: NotifPrefs | null;
    initialDisplayName: string;
    initialAvatarUrl: string | null;
    userEmail: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, label, description }: {
    enabled: boolean; onChange: (v: boolean) => void;
    label: string; description: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-[#1e2d45] last:border-0">
            <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled ? "bg-blue-600" : "bg-slate-200 dark:bg-[#263652]"}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
        </div>
    );
}

function SectionCard({ title, icon, children, id, active, onClick }: {
    title: string; icon: React.ReactNode; children: React.ReactNode;
    id: Section; active: Section; onClick: (s: Section) => void;
}) {
    const isOpen = active === id;
    return (
        <div className={`bg-white dark:bg-[#111827] rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? "border-blue-200 dark:border-blue-500/30 shadow-sm" : "border-slate-200 dark:border-[#1e2d45]"}`}>
            <button
                onClick={() => onClick(isOpen ? "" : id)}
                className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-slate-50 dark:hover:bg-[#1a2235]/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isOpen ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-[#1a2235] text-slate-500 dark:text-slate-400"}`}>
                        {icon}
                    </div>
                    <span className={`text-sm font-semibold transition-colors ${isOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>{title}</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-slate-100 dark:border-[#1e2d45]">
                    {children}
                </div>
            )}
        </div>
    );
}

function StatusBanner({ type, message }: { type: "success" | "error"; message: string }) {
    return (
        <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium mt-3 ${type === "success"
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
            }`}>
            {type === "success"
                ? <Check className="h-4 w-4 shrink-0 mt-0.5" />
                : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
            {message}
        </div>
    );
}

function SubmitButton({ pending, saved, label = "Save Changes" }: { pending: boolean; saved: boolean; label?: string }) {
    return (
        <Button
            type="submit"
            disabled={pending}
            className={`h-9 px-5 font-semibold border-0 transition-all ${saved ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
            {pending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                : saved ? <><Check className="h-4 w-4 mr-2" />Saved</>
                    : label}
        </Button>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsClient({ initialNotifPrefs, initialDisplayName, initialAvatarUrl, userEmail }: Props) {
    const [activeSection, setActiveSection] = useState<Section>("profile");

    // Profile state
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [profilePending, startProfileTransition] = useTransition();
    const [profileResult, setProfileResult] = useState<{ error?: string; success?: string } | null>(null);
    const [profileSaved, setProfileSaved] = useState(false);
    const avatarRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleProfileSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProfileResult(null);
        const fd = new FormData();
        fd.append('displayName', displayName);
        if (avatarFile) fd.append('avatar', avatarFile);
        startProfileTransition(async () => {
            const result = await updateProfile(fd);
            setProfileResult(result);
            if (result.success) {
                setProfileSaved(true);
                setAvatarFile(null);
                setTimeout(() => setProfileSaved(false), 3000);
            }
        });
    };

    // Email state
    const [emailPending, startEmailTransition] = useTransition();
    const [emailResult, setEmailResult] = useState<{ error?: string; success?: string } | null>(null);
    const [emailSaved, setEmailSaved] = useState(false);
    const [showEmailPw, setShowEmailPw] = useState(false);

    // Password state
    const [passwordPending, startPasswordTransition] = useTransition();
    const [passwordResult, setPasswordResult] = useState<{ error?: string; success?: string } | null>(null);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    // Notifications state
    const [notifPending, startNotifTransition] = useTransition();
    const [notifResult, setNotifResult] = useState<{ error?: string; success?: string } | null>(null);
    const [notifSaved, setNotifSaved] = useState(false);
    const [contractAnalyzed, setContractAnalyzed] = useState(initialNotifPrefs?.contractAnalyzed ?? true);
    const [highRiskDetected, setHighRiskDetected] = useState(initialNotifPrefs?.highRiskDetected ?? true);
    const [deadlineReminders, setDeadlineReminders] = useState(initialNotifPrefs?.deadlineReminders ?? true);
    const [marketingEmails, setMarketingEmails] = useState(initialNotifPrefs?.marketingEmails ?? false);

    // Danger state
    const [deletePending, startDeleteTransition] = useTransition();
    const [deleteResult, setDeleteResult] = useState<{ error?: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState("");

    // Password strength
    const strength = (pw: string) => {
        if (!pw) return null;
        if (pw.length < 6) return { label: "Weak", color: "bg-red-500", textColor: "text-red-500 dark:text-red-400", width: "33%" };
        if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
            return { label: "Fair", color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", width: "66%" };
        return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", width: "100%" };
    };
    const pwStrength = strength(newPw);

    const inputClass = "h-10 bg-slate-50 dark:bg-[#1a2235] border-slate-200 dark:border-[#263652] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400 dark:focus:border-blue-500/50 focus:ring-0 transition-colors";
    const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

    // ── Handlers ──
    const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEmailResult(null);
        const fd = new FormData(e.currentTarget);
        startEmailTransition(async () => {
            const result = await updateEmail(fd);
            setEmailResult(result);
            if (result.success) {
                setEmailSaved(true);
                setTimeout(() => setEmailSaved(false), 3000);
                (e.target as HTMLFormElement).reset();
            }
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordResult(null);
        const fd = new FormData(e.currentTarget);
        startPasswordTransition(async () => {
            const result = await updatePassword(fd);
            setPasswordResult(result);
            if (result.success) {
                setPasswordSaved(true);
                setNewPw(""); setConfirmPw("");
                setTimeout(() => setPasswordSaved(false), 3000);
                (e.target as HTMLFormElement).reset();
            }
        });
    };

    const handleNotifSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNotifResult(null);
        const fd = new FormData();
        fd.append('contractAnalyzed', String(contractAnalyzed));
        fd.append('highRiskDetected', String(highRiskDetected));
        fd.append('deadlineReminders', String(deadlineReminders));
        fd.append('marketingEmails', String(marketingEmails));
        startNotifTransition(async () => {
            const result = await updateNotifications(fd);
            setNotifResult(result);
            if (result.success) {
                setNotifSaved(true);
                setTimeout(() => setNotifSaved(false), 3000);
            }
        });
    };

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setDeleteResult(null);
        const fd = new FormData(e.currentTarget);
        startDeleteTransition(async () => {
            const result = await deleteAccount(fd);
            if (result?.error) setDeleteResult(result);
            // On success, deleteAccount redirects to '/' — no client handling needed
        });
    };

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
                        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">Manage your security and preferences</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-3">

                {/* ── PROFILE ── */}
                <SectionCard title="Profile" icon={<User className="h-4 w-4" />} id="profile" active={activeSection} onClick={setActiveSection}>
                    <form onSubmit={handleProfileSave} className="mt-5 space-y-5">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden ring-4 ring-blue-50 dark:ring-blue-500/10">
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        : <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                    }
                                </div>
                                <button
                                    type="button"
                                    onClick={() => avatarRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                </button>
                                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Profile Photo</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG or GIF · Max 2MB</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <button type="button" onClick={() => avatarRef.current?.click()} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                        {avatarPreview ? 'Change photo' : 'Upload photo'}
                                    </button>
                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                                            className="text-xs text-red-500 dark:text-red-400 hover:underline flex items-center gap-1"
                                        >
                                            <X className="h-3 w-3" />Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className={labelClass}>Display Name</label>
                            <Input
                                className={inputClass}
                                placeholder={userEmail.split('@')[0]}
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                Shown across ContractGuard. Leave blank to use your email username.
                            </p>
                        </div>

                        {profileResult && <StatusBanner type={profileResult.error ? "error" : "success"} message={(profileResult.error || profileResult.success)!} />}
                        <div className="flex justify-end pt-1">
                            <SubmitButton pending={profilePending} saved={profileSaved} />
                        </div>
                    </form>
                </SectionCard>

                {/* ── CHANGE EMAIL ── */}


                {/* ── CHANGE PASSWORD ── */}
                <SectionCard title="Change Password" icon={<Lock className="h-4 w-4" />} id="password" active={activeSection} onClick={setActiveSection}>
                    <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className={labelClass}>Current Password</label>
                            <div className="relative">
                                <Input name="currentPassword" type={showCurrent ? "text" : "password"} className={`${inputClass} pr-10`} placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>New Password</label>
                            <div className="relative">
                                <Input
                                    name="newPassword"
                                    type={showNew ? "text" : "password"}
                                    className={`${inputClass} pr-10`}
                                    placeholder="••••••••"
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {pwStrength && (
                                <div className="mt-2">
                                    <div className="h-1.5 bg-slate-100 dark:bg-[#1a2235] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`} style={{ width: pwStrength.width }} />
                                    </div>
                                    <p className={`text-xs mt-1 font-medium ${pwStrength.textColor}`}>{pwStrength.label} password</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Confirm New Password</label>
                            <div className="relative">
                                <Input
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    className={`${inputClass} pr-10`}
                                    placeholder="••••••••"
                                    value={confirmPw}
                                    onChange={(e) => setConfirmPw(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {confirmPw && (
                                <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${newPw === confirmPw ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                                    {newPw === confirmPw ? <><Check className="h-3 w-3" />Passwords match</> : "Passwords don't match"}
                                </p>
                            )}
                        </div>
                        {passwordResult && <StatusBanner type={passwordResult.error ? "error" : "success"} message={(passwordResult.error || passwordResult.success)!} />}
                        <div className="flex justify-end pt-1">
                            <SubmitButton pending={passwordPending} saved={passwordSaved} />
                        </div>
                    </form>
                </SectionCard>

                {/* ── NOTIFICATIONS ── */}
                <SectionCard title="Notification Preferences" icon={<Bell className="h-4 w-4" />} id="notifications" active={activeSection} onClick={setActiveSection}>
                    <form onSubmit={handleNotifSubmit} className="mt-4">
                        <Toggle enabled={contractAnalyzed} onChange={setContractAnalyzed} label="Contract analyzed" description="Get notified when your contract analysis is complete." />
                        <Toggle enabled={highRiskDetected} onChange={setHighRiskDetected} label="High risk detected" description="Immediate alerts when a contract scores above 70." />
                        <Toggle enabled={deadlineReminders} onChange={setDeadlineReminders} label="Deadline reminders" description="Email reminders 30 and 7 days before contract expiry." />
                        <Toggle enabled={marketingEmails} onChange={setMarketingEmails} label="Product updates & tips" description="Occasional emails about new features and best practices." />
                        {notifResult && <StatusBanner type={notifResult.error ? "error" : "success"} message={(notifResult.error || notifResult.success)!} />}
                        <div className="flex justify-end pt-4">
                            <SubmitButton pending={notifPending} saved={notifSaved} />
                        </div>
                    </form>
                </SectionCard>

                {/* ── DANGER ZONE ── */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-red-200 dark:border-red-500/20 overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3 border-b border-red-100 dark:border-red-500/10">
                        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                            <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Irreversible — proceed with caution</p>
                        </div>
                    </div>
                    <div className="px-5 sm:px-6 py-5">
                        <div className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/15 rounded-xl p-4">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete Account</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        Permanently deletes your account, all contracts, analysis data, todos, and settings. <strong className="text-red-600 dark:text-red-400">Cannot be undone.</strong>
                                    </p>
                                </div>
                            </div>
                            <form onSubmit={handleDeleteSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Type <span className="font-mono text-red-500 dark:text-red-400 normal-case tracking-normal font-normal">delete my account</span> to confirm
                                    </label>
                                    <Input
                                        name="confirmText"
                                        className="h-10 bg-white dark:bg-[#1a2235] border-red-200 dark:border-red-500/30 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-red-400 dark:focus:border-red-500/50 focus:ring-0"
                                        placeholder="delete my account"
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value)}
                                    />
                                </div>
                                {deleteResult?.error && <StatusBanner type="error" message={deleteResult.error} />}
                                <button
                                    type="submit"
                                    disabled={deleteConfirm !== "delete my account" || deletePending}
                                    className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    {deletePending
                                        ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting…</>
                                        : <><Trash2 className="h-4 w-4" />Permanently Delete Account</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}