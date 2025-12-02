"use client";

import { useState, useEffect } from "react";
import { getListings } from "@/app/actions/marketplace";
import { getStores } from "@/app/actions/store";
import ListingGrid from "@/components/marketplace/ListingGrid";
import CreateListingModal from "@/components/marketplace/CreateListingModal";
import CreateStoreModal from "@/components/stores/CreateStoreModal";
import { MdSearch, MdAdd, MdStore, MdLocationOn } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";

export default function MarketplacePage() {
    const [activeTab, setActiveTab] = useState<"items" | "stores">("items");
    const [listings, setListings] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todo");
    const [showCreateListingModal, setShowCreateListingModal] = useState(false);
    const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);

    const categories = ["Todo", "Coches", "Piezas", "Llantas", "Accesorios", "Otros"];

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === "items") {
                loadListings();
            } else {
                loadStores();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, category, activeTab]);

    const loadListings = async () => {
        setLoading(true);
        const result = await getListings(category, search);
        if (result.listings) {
            setListings(result.listings);
        }
        setLoading(false);
    };

    const loadStores = async () => {
        setLoading(true);
        const result = await getStores(search);
        if (result.stores) {
            setStores(result.stores);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full pb-20 max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Mercado</h1>
                            <p className="text-slate-400 text-sm mt-1">Compra, venta y tiendas</p>
                        </div>
                        {activeTab === "items" ? (
                            <button
                                onClick={() => setShowCreateListingModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center gap-2"
                            >
                                <MdAdd size={20} />
                                <span className="hidden sm:inline">Vender</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowCreateStoreModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center gap-2"
                            >
                                <MdAdd size={20} />
                                <span className="hidden sm:inline">Abrir Tienda</span>
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab("items")}
                            className={`pb-2 text-sm font-semibold transition-colors relative ${activeTab === "items" ? "text-white" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Artículos
                            {activeTab === "items" && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-full"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("stores")}
                            className={`pb-2 text-sm font-semibold transition-colors relative ${activeTab === "stores" ? "text-white" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Tiendas
                            {activeTab === "stores" && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-full"></div>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Search & Filter */}
            <div className="w-full max-w-7xl px-4 py-4 space-y-3 mx-auto box-border">
                <div className="flex items-center gap-2 w-full">
                    <div className="relative w-full">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input
                            type="text"
                            placeholder={activeTab === "items" ? "Buscar artículos..." : "Buscar tiendas..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-800/50 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-700"
                        />
                    </div>
                </div>

                {/* Category Pills (Only for Items) */}
                {activeTab === "items" && (
                    <div className="w-full overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2 flex-nowrap pb-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${category === cat
                                        ? "bg-red-500 text-white"
                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                    </div>
                ) : activeTab === "items" ? (
                    listings.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>No se encontraron resultados</p>
                        </div>
                    ) : (
                        <ListingGrid listings={listings} />
                    )
                ) : (
                    // Stores Grid
                    stores.length === 0 ? (
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
                            <div className="text-6xl mb-4 flex justify-center"><MdStore size={64} className="text-slate-600" /></div>
                            <p className="text-slate-400">No se encontraron tiendas</p>
                            <p className="text-slate-500 text-sm mt-2">
                                ¡Sé el primero en abrir una!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stores.map((store: any) => (
                                <Link
                                    href={`/stores/${store.id}`}
                                    key={store.id}
                                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-red-500 transition-colors group block"
                                >
                                    {/* Banner (if exists) or Default Gradient */}
                                    <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                                        {store.banner && (
                                            <Image src={store.banner} alt="Banner" fill className="object-fill opacity-50" unoptimized />
                                        )}
                                    </div>

                                    <div className="p-4 relative">
                                        {/* Logo */}
                                        <div className="absolute -top-10 left-4 w-20 h-20 bg-slate-900 rounded-xl border-4 border-slate-900 overflow-hidden flex items-center justify-center">
                                            {store.logo ? (
                                                <Image src={store.logo} alt={store.name} fill className="object-fill" unoptimized />
                                            ) : (
                                                <MdStore className="text-4xl text-slate-600" />
                                            )}
                                        </div>

                                        <div className="ml-24">
                                            <h3 className="text-white font-bold text-lg">{store.name}</h3>
                                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                                                <MdLocationOn />
                                                {store.location}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-slate-300 text-sm line-clamp-2">{store.description}</p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <div className="w-5 h-5 rounded-full bg-slate-700 relative overflow-hidden">
                                                    {store.owner.avatar && <Image src={store.owner.avatar} alt="Owner" fill className="object-fill" unoptimized />}
                                                </div>
                                                <span>{store.owner.username}</span>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-400">
                                                {store._count.listings} artículos
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>

            <CreateListingModal isOpen={showCreateListingModal} onClose={() => setShowCreateListingModal(false)} />
            <CreateStoreModal isOpen={showCreateStoreModal} onClose={() => setShowCreateStoreModal(false)} />
        </div>
    );
}
