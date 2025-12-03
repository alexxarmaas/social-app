"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { startConversation } from "@/app/actions/message";
import CreateListingModal from "./CreateListingModal";
import EditStoreProductModal from "@/components/stores/EditStoreProductModal";
import Image from "next/image";
import { MdEdit } from "react-icons/md";

interface ListingGridProps {
    listings: any[];
    isOwner?: boolean;
}

export default function ListingGrid({ listings, isOwner = false }: ListingGridProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const router = useRouter();

    const handleContactSeller = async (listing: any) => {
        const sellerId = listing.sellerId;
        if (!sellerId) {
            toast.error('Vendedor no disponible');
            return;
        }

        const prefill = `Hola ${listing.sellerId.username}, estoy interesado en ${listing.title}, ¿podrías darme mas información?`;

        try {
            const result = await startConversation(sellerId);
            if (result.error) {
                // If not authorized, redirect to login with next param
                if (typeof result.error === 'string' && result.error.toLowerCase().includes('no autorizado')) {
                    const next = encodeURIComponent(`/messages?prefill=${encodeURIComponent(prefill)}`);
                    router.push(`/login?next=${next}`);
                    return;
                }
                toast.error(result.error || 'Error iniciando conversación');
                return;
            }

            if (result.conversationId) {
                const convId = result.conversationId;
                router.push(`/messages?id=${convId}&prefill=${encodeURIComponent(prefill)}`);
            }
        } catch (err) {
            console.error('Error contacting seller', err);
            toast.error('Error iniciando conversación');
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-3 w-full">
                <h2 className="text-xl font-bold text-white">Destacados</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full justify-center justify-items-center">
                {listings.map((listing) => {
                    const images = listing.imageUrls ? JSON.parse(listing.imageUrls) : [];
                    const mainImage = images[0];

                    return (
                        <div key={listing.id} className="w-full max-w-xs sm:max-w-full sm:w-auto bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-red-500/50 transition-colors group box-border relative mx-auto">
                            <div className="aspect-[4/3] sm:aspect-square bg-slate-700 relative">
                                {mainImage ? (
                                    <Image src={mainImage} alt={listing.title} fill className="object-fill" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-bold">
                                    {listing.price}€
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="text-white font-semibold truncate">{listing.title}</h3>
                                <p className="text-slate-400 text-xs mt-1 truncate">{listing.description}</p>
                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                    <div className="w-4 h-4 rounded-full bg-slate-600 relative overflow-hidden">
                                        {listing.seller.avatar && <Image src={listing.seller.avatar} alt="Seller" fill className="object-fill" unoptimized />}
                                    </div>
                                    <span>{listing.seller.username}</span>
                                </div>
                            </div>

                            <div className="p-3 pt-0 flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.preventDefault(); handleContactSeller(listing); }}
                                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
                                >
                                    Contactar vendedor
                                </button>
                            </div>

                            {isOwner && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setEditingProduct(listing);
                                    }}
                                    className="absolute top-2 left-2 p-2 bg-slate-900/80 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <MdEdit size={16} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {showCreateModal && <CreateListingModal isOpen={true} onClose={() => setShowCreateModal(false)} />}

            {editingProduct && (
                <EditStoreProductModal
                    isOpen={!!editingProduct}
                    onClose={() => setEditingProduct(null)}
                    product={editingProduct}
                />
            )}
        </>
    );
}
