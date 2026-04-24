"use client"; // This magic line makes it interactive

import { Button } from "@/components/ui/button";

export function RefreshButton() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
        >
            Refresh Status
        </Button>
    );
}