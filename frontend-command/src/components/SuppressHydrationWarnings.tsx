"use client";

import { useEffect } from "react";

export default function SuppressHydrationWarnings() {
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args: unknown[]) => {
            const msg = typeof args[0] === "string" ? args[0] : "";
            if (msg.includes("hydrated") && msg.includes("didn't match")) return;
            if (msg.includes("Hydration")) return;
            originalError.apply(console, args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);
    return null;
}
