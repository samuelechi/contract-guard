import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
    SidebarMenuItem, SidebarMenuButton, SidebarMenu,
} from "@/components/ui/sidebar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
    ChevronUp, Home, Settings, LogOut, UserRoundCog, ShieldCheck,
    FileUp, FileText, MessageSquare, BarChart3, Files, Webhook
} from "lucide-react";
import { LogoutButton } from "@/app/features/auth/components/logoutButton";

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Upload Contract", url: "/dashboard/upload", icon: FileUp },
    { title: "Contracts History", url: "/dashboard/contracts", icon: FileText },
    { title: "Chat with AI", url: "/dashboard/chat", icon: MessageSquare },
    { title: "Contract Templates", url: "/dashboard/templates", icon: Files },
    { title: "Risk Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "API Integrations", url: "/dashboard/api", icon: Webhook },
];

export default function AppSidebar() {
    return (
        <Sidebar className="border-r border-slate-200 dark:border-[#1e2d45] bg-white dark:bg-[#111827] transition-colors duration-200">

            {/* HEADER */}
            <SidebarHeader className="p-5 border-b border-slate-100 dark:border-[#1e2d45]">
                <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                        Contract<span className="text-blue-600 dark:text-blue-400">Guard</span>
                    </span>
                </Link>
            </SidebarHeader>

            {/* NAV */}
            <SidebarContent className="px-3 pt-5">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-0.5">
                            {navItems.slice(0, 3).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}
                                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2235] data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400 rounded-xl transition-all h-10"
                                    >
                                        <Link href={item.url} className="flex items-center gap-3 px-3">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1a2235] flex items-center justify-center shrink-0">
                                                <item.icon className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
                        Tools
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-0.5">
                            {navItems.slice(3).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}
                                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2235] data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400 rounded-xl transition-all h-10"
                                    >
                                        <Link href={item.url} className="flex items-center gap-3 px-3">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1a2235] flex items-center justify-center shrink-0">
                                                <item.icon className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="p-3 border-t border-slate-100 dark:border-[#1e2d45]">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg"
                                    className="w-full justify-between bg-slate-50 dark:bg-[#1a2235] hover:bg-slate-100 dark:hover:bg-[#212d42] border border-slate-200 dark:border-[#263652] rounded-xl transition-colors p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-[#263652] text-slate-600 dark:text-slate-300">
                                            <Settings className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Settings</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Preferences</span>
                                        </div>
                                    </div>
                                    <ChevronUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top"
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-50 rounded-xl p-2 shadow-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d45]"
                                align="center" sideOffset={12}
                            >
                                <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2.5 hover:bg-slate-100 dark:hover:bg-[#1a2235] mb-1 focus:bg-slate-100 dark:focus:bg-[#1a2235]">
                                    <Link href="/dashboard/settings" className="flex items-center gap-2.5 w-full text-slate-700 dark:text-slate-300">
                                        <UserRoundCog className="h-4 w-4" />
                                        <span className="text-sm font-medium">Account Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2.5 text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 hover:bg-red-50 dark:hover:bg-red-500/10">
                                    <div className="flex items-center gap-2.5 w-full">
                                        <LogOut className="h-4 w-4" />
                                        <div className="text-sm font-medium w-full"><LogoutButton /></div>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
