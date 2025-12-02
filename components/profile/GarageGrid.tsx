"use client";

import { useState } from "react";
import { MdClose } from "react-icons/md";
import AddCarModal from "./AddCarModal";
import EditCarModal from "./EditCarModal";
import Image from "next/image";
import { deleteCar } from "@/app/actions/profile";
import { MdAdd, MdDelete, MdEdit, MdDirectionsCar } from "react-icons/md";

interface GarageGridProps {
    cars: any[];
    isOwner?: boolean;
}

export default function GarageGrid({ cars, isOwner = false, hideHeader = false }: { cars: any[], isOwner?: boolean, hideHeader?: boolean }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCar, setEditingCar] = useState<any | null>(null);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este coche?")) {
            await deleteCar(id);
        }
    };

    return (
        <>
            {!hideHeader && (
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MdDirectionsCar className="text-red-500" /> Garaje
                    </h2>
                    {isOwner && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 border border-slate-700 flex items-center gap-2"
                        >
                            <MdAdd /> Añadir Coche
                        </button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cars.map((car) => (
                    <div key={car.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden group">
                        <div className="relative h-48 bg-slate-700">
                            {car.imageUrl ? (
                                <div onClick={() => setSelectedImage(car)} className="w-full h-full cursor-pointer">
                                    <Image src={car.imageUrl} alt={car.model} fill className="object-fit" />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">
                                    <MdDirectionsCar size={48} />
                                </div>
                            )}
                            {isOwner && (
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingCar(car)}
                                        className="p-2 bg-black/60 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <MdEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(car.id)}
                                        className="p-2 bg-black/60 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{car.make} {car.model}</h3>
                                    <p className="text-slate-400 text-sm">{car.year}</p>
                                </div>
                                {!isOwner && car.owner && (
                                    <div className="flex items-center gap-2 bg-slate-700/50 rounded-full pr-3 pl-1 py-1">
                                        <div className="w-6 h-6 rounded-full overflow-hidden relative bg-slate-600">
                                            {car.owner.avatar ? (
                                                <Image src={car.owner.avatar} alt={car.owner.username} fill className="object-fill" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold">
                                                    {car.owner.name?.[0] || car.owner.username?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-300 font-medium truncate max-w-[80px]">
                                            {car.owner.username}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {car.modifications && (
                                <p className="text-slate-300 text-sm mt-2 border-t border-slate-700 pt-2 " style={{ whiteSpace: 'pre-line' }}>
                                    <span className="text-slate-500 text-xs uppercase font-bold block mb-1">Mods</span>
                                    {car.modifications}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {cars.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700 rounded-xl">
                        <div className="text-slate-500 text-6xl mb-4 flex justify-center"><MdDirectionsCar /></div>
                        <p className="text-slate-400">Tu garaje está vacío</p>
                        {isOwner && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 text-red-500 font-semibold hover:text-red-400"
                            >
                                Añadir primer coche
                            </button>
                        )}
                    </div>
                )}
            </div>

            {showAddModal && <AddCarModal onClose={() => setShowAddModal(false)} />}
            {editingCar && <EditCarModal car={editingCar} onClose={() => setEditingCar(null)} />}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6" onClick={e => e.stopPropagation()}>
                        <div className="relative flex-1 aspect-video md:aspect-auto bg-black rounded-xl overflow-hidden">
                            <Image
                                src={selectedImage.imageUrl}
                                alt={selectedImage.model}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="w-full md:w-80 bg-zinc-900 rounded-xl p-6 flex flex-col h-fit">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-white font-bold text-sm">{selectedImage.make} {selectedImage.model}</p>
                                    <p className="text-zinc-500 text-xs">{selectedImage.year}</p>
                                </div>
                                <button onClick={() => setSelectedImage(null)} className="text-zinc-400 hover:text-white">
                                    <MdClose size={24} />
                                </button>
                            </div>

                            {selectedImage.modifications && (
                                <p className="text-zinc-300 text-sm mb-6" style={{ whiteSpace: 'pre-line' }}>{selectedImage.modifications}</p>
                            )}

                            <button
                                onClick={() => setSelectedImage(null)}
                                className="mt-auto w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
