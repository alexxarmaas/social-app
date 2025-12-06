"use client";

import Image from "next/image";
import { MdClose, MdAttachMoney, MdCategory, MdDescription, MdLabel, MdPerson, MdEdit, MdDelete } from "react-icons/md";
import { useSession } from "next-auth/react";
import { deleteStoreListing } from "@/app/actions/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onContactSeller: (product: any) => void;
    onEdit?: (product: any) => void;
}

export default function ProductModal({ isOpen, onClose, product, onContactSeller, onEdit }: ProductModalProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !product) return null;

    const images = product.imageUrls ? JSON.parse(product.imageUrls) : [];
    const mainImage = images[0];
    const isOwner = session?.user?.id === product.sellerId;

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteStoreListing(product.id);

        if (result.error) {
            toast.error(result.error);
            setIsDeleting(false);
        } else {
            toast.success("Producto eliminado correctamente");
            onClose();
            router.refresh();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-900 rounded-2xl w-full max-w-4xl border border-slate-700 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-black relative min-h-[300px] md:min-h-full">
                    {mainImage ? (
                        <Image
                            src={mainImage}
                            alt={product.title}
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 md:hidden bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 flex flex-col md:h-full">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{product.title}</h2>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <span className="bg-slate-800 px-2 py-1 rounded">{product.category}</span>
                                <span>•</span>
                                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="hidden md:block text-slate-400 hover:text-white transition-colors">
                            <MdClose size={28} />
                        </button>
                    </div>

                    <div className="p-6 md:overflow-y-auto md:flex-1 space-y-6">
                        {/* Price */}
                        <div className="flex items-center gap-2 text-3xl font-bold text-white">
                            {product.price}€
                        </div>

                        {/* Seller Info */}
                        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-700 relative overflow-hidden">
                                    {product.seller.avatar ? (
                                        <Image src={product.seller.avatar} alt={product.seller.username} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                                            <MdPerson size={24} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{product.seller.username}</p>
                                    <p className="text-slate-400 text-xs">Vendedor</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-slate-400 font-medium mb-2 flex items-center gap-2">
                                <MdDescription /> Descripción
                            </h3>
                            <p className="text-slate-200 whitespace-pre-wrap">{product.description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/30 p-3 rounded-lg">
                                <p className="text-slate-500 text-xs mb-1">Estado</p>
                                <p className="text-white font-medium flex items-center gap-2">
                                    <MdLabel className="text-slate-400" />
                                    {product.condition}
                                </p>
                            </div>
                            <div className="bg-slate-800/30 p-3 rounded-lg">
                                <p className="text-slate-500 text-xs mb-1">Categoría</p>
                                <p className="text-white font-medium flex items-center gap-2">
                                    <MdCategory className="text-slate-400" />
                                    {product.category}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-800 mt-auto space-y-3">
                        {isOwner ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onEdit && onEdit(product)}
                                    className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MdEdit size={20} />
                                    Editar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-500/10 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <MdDelete size={20} />
                                    {isDeleting ? "Eliminando..." : "Eliminar"}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onContactSeller(product)}
                                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                Contactar al Vendedor
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
