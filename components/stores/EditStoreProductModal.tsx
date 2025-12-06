"use client";

import { useState } from "react";
import { MdClose, MdCloudUpload, MdDelete } from "react-icons/md";
import { updateStoreListing, deleteStoreListing } from "@/app/actions/store";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface EditStoreProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
}

export default function EditStoreProductModal({ isOpen, onClose, product }: EditStoreProductModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Parse existing images
    const existingImages = product.imageUrls ? JSON.parse(product.imageUrls) : [];
    const [imagePreview, setImagePreview] = useState<string | null>(existingImages[0] || null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        if (imageFile) {
            formData.set("image", imageFile);
        }

        const result = await updateStoreListing(product.id, formData);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            onClose();
            window.location.reload();
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
            return;
        }

        setIsLoading(true);
        const result = await deleteStoreListing(product.id);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            onClose();
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-white">Editar Producto</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Imagen del Producto
                                </label>
                                <div className="relative aspect-video bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-500 transition-colors overflow-hidden group">
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-fill"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                            <MdCloudUpload size={48} className="mb-2" />
                                            <span className="text-sm">Click para subir imagen</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="text-white font-medium">Cambiar imagen</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    defaultValue={product.title}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="Ej: Llantas BBS 18"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Precio (€)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    defaultValue={product.price}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Categoría
                                </label>
                                <select
                                    name="category"
                                    defaultValue={product.category}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                >
                                    <option value="parts">Piezas / Recambios</option>
                                    <option value="wheels">Llantas / Neumáticos</option>
                                    <option value="accessories">Accesorios</option>
                                    <option value="car">Coche completo</option>
                                    <option value="other">Otros</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Estado
                                </label>
                                <select
                                    name="condition"
                                    defaultValue={product.condition}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                >
                                    <option value="new">Nuevo</option>
                                    <option value="used">Usado</option>
                                    <option value="refurbished">Reacondicionado</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={product.description}
                                    required
                                    rows={4}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                                    placeholder="Describe el producto..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <MdDelete size={20} />
                                Eliminar
                            </button>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-6 py-3 text-slate-400 hover:text-white font-semibold transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
