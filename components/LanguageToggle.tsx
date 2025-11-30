"use client";

import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "es" : "en";
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:border-red-500 transition-all flex items-center gap-2"
        >
            <span>{i18n.language === "en" ? "🇺🇸" : "🇪🇸"}</span>
            <span>{i18n.language === "en" ? "English" : "Español"}</span>
        </button>
    );
}
