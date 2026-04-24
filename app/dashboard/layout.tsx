import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from './component/app-sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}