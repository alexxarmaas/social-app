"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { searchAll, searchUsers, searchCars, searchClubs } from "@/app/actions/search";
import { MdFilterList, MdSearch } from "react-icons/md";

type Category = "all" | "users" | "cars" | "clubs";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [category, setCategory] = useState<Category>("all");
    const [results, setResults] = useState<any>({ users: [], cars: [], clubs: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ users: [], cars: [], clubs: [] });
            return;
        }

        const performSearch = async () => {
            setLoading(true);
            try {
                let searchResults;

                switch (category) {
                    case "users":
                        searchResults = await searchUsers(query);
                        setResults({ users: searchResults.users || [], cars: [], clubs: [] });
                        break;
                    case "cars":
                        searchResults = await searchCars(query);
                        setResults({ users: [], cars: searchResults.cars || [], clubs: [] });
                        break;
                    case "clubs":
                        searchResults = await searchClubs(query);
                        setResults({ users: [], cars: [], clubs: searchResults.clubs || [] });
                        break;
                    default:
                        searchResults = await searchAll(query);
                        setResults({
                            users: searchResults.users || [],
                            cars: searchResults.cars || [],
                            clubs: searchResults.clubs || [],
                        });
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query, category]);

    const categories = [
        { id: "all" as Category, label: "Todo" },
        { id: "users" as Category, label: "Usuarios" },
        { id: "cars" as Category, label: "Coches" },
        { id: "clubs" as Category, label: "Clubs" },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Buscar</h1>
                    <div className="w-full max-w-xs flex justify-center">
                        <SearchBar onSearch={setQuery} autoFocus placeholder="Buscar usuarios, coches, clubs..." />
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="max-w-2xl mx-auto px-2 py-2 sticky top-[88px] bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-30 flex justify-center">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full ">
                    <MdFilterList className="text-slate-400 flex-shrink-0" size={20} />
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`px-3 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${category === cat.id
                                    ? "bg-red-500 text-white"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {query.trim().length < 2 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-500 text-6xl mb-4 flex justify-center"><MdSearch size={64} /></div>
                        <p className="text-slate-400 text-lg">Comienza a buscar</p>
                        <p className="text-slate-500 text-sm mt-2">Escribe al menos 2 caracteres para buscar</p>
                    </div>
                ) : (
                    <SearchResults
                        users={results.users}
                        cars={results.cars}
                        clubs={results.clubs}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}
