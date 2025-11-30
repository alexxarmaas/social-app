import { getStoreById } from "@/app/actions/store";
import ListingGrid from "@/components/marketplace/ListingGrid";
import GarageGrid from "@/components/profile/GarageGrid";
import StoreManagerButton from "@/components/stores/StoreManagerButton"; // Client component for the button/modal
import AddStoreProductButton from "@/components/stores/AddStoreProductButton";
import { MdLocationOn, MdStore, MdArrowBack, MdAccessTime } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export default async function StoreDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { store, error } = await getStoreById(id);
    const session = await getServerSession(authOptions);

    if (error || !store) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <p className="text-xl mb-4">{error || "Tienda no encontrada"}</p>
                <Link href="/marketplace" className="text-red-400 hover:text-red-300">
                    ← Volver al Mercado
                </Link>
            </div>
        );
    }

    const isOwner = session?.user?.id === store.ownerId;

    return (
        <div className="min-h-screen pb-20">
            {/* Banner */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                {store.banner && (
                    <Image src={store.banner} alt="Banner" fill className="object-contain opacity-80" unoptimized />
                )}
                <Link
                    href="/marketplace"
                    className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                >
                    <MdArrowBack size={24} />
                </Link>

                {/* Manager Button */}
                {isOwner && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <AddStoreProductButton store={store} />
                        <StoreManagerButton store={store} />
                    </div>
                )}
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {/* Store Header Info */}
                <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-start md:items-end gap-6">
                    <div className="w-32 h-32 bg-slate-900 rounded-2xl border-4 border-slate-900 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                        {store.logo ? (
                            <Image src={store.logo} alt={store.name} fill className="object-contain" unoptimized />
                        ) : (
                            <MdStore className="text-6xl text-slate-600" />
                        )}
                    </div>
                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl font-bold text-white">{store.name}</h1>
                        <div className="flex items-center gap-2 text-slate-300 mt-1">
                            <MdLocationOn className="text-red-500" />
                            <span>{store.location}</span>
                        </div>
                        {store.openingHours && (
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                <MdAccessTime className="text-red-500" />
                                <span>{store.openingHours}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8">
                    <h2 className="text-lg font-bold text-white mb-2">Sobre la tienda</h2>
                    <p className="text-slate-300 whitespace-pre-wrap">{store.description}</p>
                    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-sm text-slate-400">
                        <span>Propietario:</span>
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-6 h-6 rounded-full bg-slate-700 relative overflow-hidden">
                                {store.owner.avatar && <Image src={store.owner.avatar} alt="Owner" fill className="object-contain" unoptimized />}
                            </div>
                            <span>{store.owner.username}</span>
                        </div>
                    </div>
                </div>

                {/* Garage Section */}
                <div className="mb-12">
                    <GarageGrid cars={store.owner.cars || []} isOwner={false} />
                </div>

                {/* Store Listings */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Artículos en Venta</h2>
                    {store.listings.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800">
                            <p>Esta tienda aún no tiene artículos publicados.</p>
                        </div>
                    ) : (
                        <ListingGrid listings={store.listings} isOwner={isOwner} />
                    )}
                </div>
            </div>
        </div>
    );
}
