"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MdAdd, MdClose, MdFavorite, MdFavoriteBorder, MdDelete } from "react-icons/md";
import { getEventPhotos, uploadEventPhoto } from "@/app/actions/gallery";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { handleUnauth } from '@/components/auth/handleUnauth';
import ImageUpload from "@/components/ui/ImageUpload";

interface EventGalleryProps {
    eventId: string;
    isAttendee: boolean;
    isCreator: boolean;
    canUpload: boolean;
}

export default function EventGallery({ eventId, isAttendee, isCreator, canUpload }: EventGalleryProps) {
    const { data: session } = useSession();
    const [photos, setPhotos] = useState<any[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

    // Upload state
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [caption, setCaption] = useState("");

    useEffect(() => {
        loadPhotos();
    }, [eventId]);

    const loadPhotos = async () => {
        const result = await getEventPhotos(eventId);
        if (result.photos) {
            setPhotos(result.photos);
        }
        setLoading(false);
    };

    const handleUpload = async () => {
        if (!uploadedUrl) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("photoUrl", uploadedUrl);
        formData.append("caption", caption);

        const result = await uploadEventPhoto(eventId, formData);

        if (result.error) {
            if (handleUnauth(result, router, `/events/${eventId}`)) return;
            toast.error(result.error);
        } else {
            toast.success("Foto subida correctamente");
            setShowUploadModal(false);
            setUploadedUrl("");
            setCaption("");
            loadPhotos();
        }
        setUploading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Galería del Evento</h3>
                {(session && (isAttendee || isCreator)) && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                        <MdAdd size={20} /> Subir Foto
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-zinc-800 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-white/5">
                    <p className="text-zinc-500">No hay fotos todavía. ¡Sé el primero en subir una!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            onClick={() => setSelectedPhoto(photo)}
                            className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl bg-zinc-900"
                        >
                            <Image
                                src={photo.url}
                                alt={photo.caption || "Event photo"}
                                fill
                                className="object-fill transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Subir Foto</h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-zinc-400 hover:text-white">
                                <MdClose size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative aspect-video bg-zinc-800 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group">
                                {uploadedUrl ? (
                                    <Image src={uploadedUrl} alt="Preview" fill className="object-fill" />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageUpload
                                            onUploadComplete={(url) => {
                                                setUploadedUrl(url);
                                                toast.success("Imagen cargada");
                                            }}
                                            type="event"
                                            label="Seleccionar Imagen"
                                        />
                                    </div>
                                )}

                                {uploadedUrl && (
                                    <button
                                        onClick={() => setUploadedUrl("")}
                                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <MdClose size={20} />
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder="Añadir un pie de foto..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                            />

                            <button
                                onClick={handleUpload}
                                disabled={!uploadedUrl || uploading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? "Publicando..." : "Publicar Foto"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo View Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6" onClick={e => e.stopPropagation()}>
                        <div className="relative flex-1 aspect-video md:aspect-auto bg-black rounded-xl overflow-hidden">
                            <Image
                                src={selectedPhoto.url}
                                alt={selectedPhoto.caption || "Event photo"}
                                fill
                                className="object-fill"
                            />
                        </div>
                        <div className="w-full md:w-80 bg-zinc-900 rounded-xl p-6 flex flex-col h-fit">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                                    {selectedPhoto.uploader.avatar ? (
                                        <Image src={selectedPhoto.uploader.avatar} alt={selectedPhoto.uploader.username} fill className="object-fill" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                                            {selectedPhoto.uploader.username[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{selectedPhoto.uploader.username}</p>
                                    <p className="text-zinc-500 text-xs">
                                        {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {selectedPhoto.caption && (
                                <p className="text-zinc-300 text-sm mb-6">{selectedPhoto.caption}</p>
                            )}

                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="mt-auto w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
