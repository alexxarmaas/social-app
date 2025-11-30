"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../app/lib/i18n";
import { ReactNode, useEffect, useState } from "react";

export default function I18nProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>; // Render children without translation on server/initial render to avoid hydration mismatch if possible, or just render
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
