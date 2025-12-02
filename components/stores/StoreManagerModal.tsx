"use client";

import { useState } from "react";
import { updateStore, addStoreListing } from "@/app/actions/store";
import { MdClose, MdStore, MdAddBox, MdEdit, MdSave, MdImage } from "react-icons/md";
import Image from "next/image";

interface StoreManagerModalProps {
    store: any;
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "info" | "products";
}

export default function StoreManagerModal({ store, isOpen, onClose, initialTab = "info" }: StoreManagerModalProps) {
    const [activeTab, setActiveTab] = useState<"info" | "products">(initialTab);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Edit Info State
    const [infoData, setInfoData] = useState({
        name: store.name,
        description: store.description || "",
        location: store.location || "",
        logo: store.logo || "",
        banner: store.banner || ""
    });

    // Add Product State
    const [productData, setProductData] = useState({
        title: "",
        price: "",
        category: "Piezas",
        condition: "new",
        description: "",
        imageUrl: ""
    });

    // Reset tab when opening
    if (!isOpen) return null;

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("name", infoData.name);
        formData.append("description", infoData.description);
        formData.append("location", infoData.location);
        formData.append("logo", infoData.logo);
        formData.append("banner", infoData.banner);

        const result = await updateStore(store.id, formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess("Información actualizada correctamente");
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1000);
        }
        setLoading(false);
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
        if (productData.imageUrl) {
            // Note: addStoreListing expects a File object for 'image' field, or we need to adjust it to accept URL string.
            // The current addStoreListing implementation expects 'image' as File.
            // But here we are inputting URL string.
            // We should probably modify addStoreListing to accept imageUrl string as well, or change UI to file upload.
            // Given the UI has text input for URL, let's modify addStoreListing to accept imageUrl.
            // But for now, let's just append it as 'imageUrl' and hope addStoreListing handles it or we fix addStoreListing.
            // Wait, addStoreListing in store.ts:
            // const imageFile = formData.get("image") as File | null;
            // It only handles file.
            // I should update addStoreListing to handle imageUrl string too.
            formData.append("imageUrl", productData.imageUrl);
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
                description: "",
                imageUrl: ""
            });
            // Don't close, allow adding more
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MdStore className="text-red-500" />
                        Gestor de Tienda
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`pb-2 font-semibold transition-colors relative ${activeTab === "info" ? "text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            <div className="flex items-center gap-2">
                                <MdEdit /> Editar Info
                            </div>
                            {activeTab === "info" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab("products")}
                            className={`pb-2 font-semibold transition-colors relative ${activeTab === "products" ? "text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            <div className="flex items-center gap-2">
                                <MdAddBox /> Añadir Producto
                            </div>
                            {activeTab === "products" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-full"></div>}
                        </button>
                    </div>

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

                    {activeTab === "info" ? (
                        <form onSubmit={handleUpdateInfo} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={infoData.name}
                                        onChange={(e) => setInfoData({ ...infoData, name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Ubicación</label>
                                    <input
                                        type="text"
                                        value={infoData.location}
                                        onChange={(e) => setInfoData({ ...infoData, location: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
                                <textarea
                                    value={infoData.description}
                                    onChange={(e) => setInfoData({ ...infoData, description: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors min-h-[100px]"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Logo URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={infoData.logo}
                                            onChange={(e) => setInfoData({ ...infoData, logo: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                        />
                                        {infoData.logo && (
                                            <div className="w-10 h-10 rounded bg-slate-800 relative overflow-hidden flex-shrink-0 border border-slate-700">
                                                <Image src={infoData.logo} alt="Preview" fill className="object-fill" unoptimized />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Banner URL</label>
                                    <input
                                        type="text"
                                        value={infoData.banner}
                                        onChange={(e) => setInfoData({ ...infoData, banner: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <MdSave size={20} />
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </form>
                    ) : (
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
                                <label className="block text-sm font-medium text-slate-300 mb-1">Imagen URL</label>
                                <div className="relative">
                                    <MdImage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={productData.imageUrl}
                                        onChange={(e) => setProductData({ ...productData, imageUrl: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                        placeholder="https://..."
                                    />
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
                    )}
                </div>
            </div>
        </div>
    );
}
