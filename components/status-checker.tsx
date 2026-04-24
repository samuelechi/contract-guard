"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StatusChecker({ status }: { status: string }) {
    const router = useRouter();

    useEffect(() => {
        // Only poll if the status is "ANALYZING"
        if (status === "ANALYZING" || status === "PENDING") {

            // Set up a timer to refresh every 2 seconds
            const interval = setInterval(() => {
                router.refresh();
                console.log("🔄 Checking for updates...");
            }, 2000);

            // Cleanup: Stop the timer when component unmounts or status changes
            return () => clearInterval(interval);
        }
    }, [status, router]);

    return null; // This component is invisible
}