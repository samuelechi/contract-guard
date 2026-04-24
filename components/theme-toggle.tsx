"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        setIsDark(resolvedTheme === "dark");
    }, [resolvedTheme]);

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
                position: "relative",
                width: "56px",
                height: "28px",
                borderRadius: "999px",
                border: `1px solid ${isDark ? "rgba(59,130,246,0.4)" : "#cbd5e1"}`,
                background: isDark ? "rgba(59,130,246,0.15)" : "#e2e8f0",
                display: "flex",
                alignItems: "center",
                padding: "0 4px",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.3s",
            }}
        >
            <Sun style={{
                position: "absolute", left: "6px",
                width: "14px", height: "14px",
                color: isDark ? "#64748b" : "#f59e0b",
                opacity: isDark ? 0.3 : 1,
            }} />
            <Moon style={{
                position: "absolute", right: "6px",
                width: "14px", height: "14px",
                color: isDark ? "#60a5fa" : "#94a3b8",
                opacity: isDark ? 1 : 0.3,
            }} />
            <span style={{
                position: "absolute",
                width: "20px", height: "20px",
                borderRadius: "999px",
                background: isDark ? "#60a5fa" : "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transform: isDark ? "translateX(28px)" : "translateX(0px)",
                transition: "all 0.3s",
            }} />
        </button>
    );
}