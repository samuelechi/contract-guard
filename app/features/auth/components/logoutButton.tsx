"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

// Define what this component can accept manually
interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export const LogoutButton = ({ className, variant = "destructive", size, ...props }: LogoutButtonProps) => {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    return (
        <Button 
            onClick={handleLogout} 
            variant={variant}
            size={size}
            className={className}
            {...props}
        >
            Sign Out
        </Button>
    );
};