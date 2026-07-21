"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";

export default function LightboxGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    if (active === null) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setActive(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [active]);

  if (!images.length) return <p className="rounded-2xl border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">Aun no hay imagenes en la galeria.</p>;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, index) => <button key={url} type="button" onClick={() => setActive(index)} className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800"><Image src={url} alt={`${title}, imagen ${index + 1}`} fill className="object-cover transition hover:scale-105" sizes="(max-width: 768px) 50vw, 20vw" /></button>)}
      </div>
      {active !== null ? (
        <div role="dialog" aria-modal="true" aria-label={`Galeria de ${title}`} className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4">
          <button type="button" aria-label="Cerrar" onClick={() => setActive(null)} className="absolute right-5 top-5 rounded-full border border-white/20 p-2 text-white"><MdClose size={28} /></button>
          <button type="button" aria-label="Anterior" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 rounded-full border border-white/20 p-2 text-white sm:left-6"><MdChevronLeft size={32} /></button>
          <div className="relative h-[80vh] w-[85vw]"><Image src={images[active]} alt={`${title}, imagen ampliada`} fill className="object-contain" sizes="90vw" priority /></div>
          <button type="button" aria-label="Siguiente" onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 rounded-full border border-white/20 p-2 text-white sm:right-6"><MdChevronRight size={32} /></button>
        </div>
      ) : null}
    </>
  );
}
