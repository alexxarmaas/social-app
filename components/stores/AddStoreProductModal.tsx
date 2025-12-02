"use client";

import { useState } from "react";
import { addStoreListing } from "@/app/actions/store";
import { MdClose, MdAddBox, MdImage } from "react-icons/md";
import Image from "next/image";

interface AddStoreProductModalProps {
    store: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddStoreProductModal({ store, isOpen, onClose }: AddStoreProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [productData, setProductData] = useState({
        title: "",
        price: "",
        category: "Piezas",
        condition: "new",
        description: ""
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("title", productData.title);
        formData.append("price", productData.price);
        formData.append("category", productData.category);
        formData.append("condition", productData.condition);
        formData.append("description", productData.description);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        const result = await addStoreListing(store.id, formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess("Producto añadido correctamente");
            setProductData({
                title: "",
                price: "",
                category: "Piezas",
                condition: "new",
                description: ""
            });
            setImageFile(null);
            setImagePreview("");
            // Don't close immediately, allow adding more
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MdAddBox className="text-red-500" />
                        Añadir Producto
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded-lg text-sm mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Título del Producto *</label>
                            <input
                                type="text"
                                required
                                value={productData.title}
                                onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Ej: Llantas BBS 18"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Precio (€) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={productData.price}
                                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
                                <select
                                    value={productData.category}
                                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                >
                                    <option value="Coches">Coches</option>
                                    <option value="Piezas">Piezas</option>
                                    <option value="Llantas">Llantas</option>
                                    <option value="Accesorios">Accesorios</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Condición</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="condition"
                                        value="new"
                                        checked={productData.condition === "new"}
                                        onChange={(e) => setProductData({ ...productData, condition: e.target.value })}
                                        className="text-red-500 focus:ring-red-500 bg-slate-800 border-slate-700"
                                    />
                                    <span className="text-white">Nuevo</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="condition"
                                        value="used"
                                        checked={productData.condition === "used"}
                                        onChange={(e) => setProductData({ ...productData, condition: e.target.value })}
                                        className="text-red-500 focus:ring-red-500 bg-slate-800 border-slate-700"
                                    />
                                    <span className="text-white">Usado</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Descripción *</label>
                            <textarea
                                required
                                value={productData.description}
                                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors min-h-[100px]"
                                placeholder="Detalles del producto..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Imagen</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Preview" fill className="object-fill" unoptimized />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500">
                                            <MdImage size={32} />
                                        </div>
                                    )}
                                </div>
                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm">
                                    Subir Imagen
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <MdAddBox size={20} />
                            {loading ? "Añadiendo..." : "Añadir Producto"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
