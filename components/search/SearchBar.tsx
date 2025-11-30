"use client";

import { useState, useEffect, useCallback } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { useRouter } from "next/navigation";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export default function SearchBar({ onSearch, placeholder = "Buscar usuarios, coches, clubs...", autoFocus = false }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    // Debounce search
    useEffect(() => {
        if (query.trim().length < 2) return;

        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(query);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleClear = () => {
        setQuery("");
        if (onSearch) {
            onSearch("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <div className={`relative flex items-center transition-all ${isFocused ? 'ring-2 ring-red-500' : ''} rounded-lg`}>
                <MdSearch className="absolute left-4 text-slate-400 text-xl pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full bg-slate-800/50 text-white placeholder-slate-400 rounded-lg pl-12 pr-12 py-3 focus:outline-none border border-slate-700"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <MdClose size={20} />
                    </button>
                )}
            </div>
        </form>
    );
}
