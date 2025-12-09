"use client";

import { useRouter } from "next/navigation";

export function handleUnauth(result: any, router: ReturnType<typeof useRouter>, nextPath?: string) {
    if (!result) return false;
    if (result.code === "UNAUTHENTICATED") {
        const dest = nextPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
        router.push(`/login?next=${encodeURIComponent(dest)}`);
        return true;
    }
    return false;
}

export default handleUnauth;
