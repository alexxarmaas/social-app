"use client";

import Image from "next/image";
import { useState, type SyntheticEvent } from "react";

type CoverShape = "unknown" | "wide" | "landscape" | "square" | "portrait";

function classifyShape(width: number, height: number): CoverShape {
  if (width <= 0 || height <= 0) return "unknown";
  const ratio = width / height;
  if (ratio >= 1.7) return "wide";
  if (ratio >= 1.15) return "landscape";
  if (ratio >= 0.85) return "square";
  return "portrait";
}

function frameClass(shape: CoverShape) {
  switch (shape) {
    case "wide":
      return "aspect-[16/8] max-w-none";
    case "landscape":
      return "aspect-[4/3] max-w-4xl";
    case "portrait":
      return "aspect-[4/5] max-w-[34rem]";
    case "square":
      return "aspect-square max-w-[40rem]";
    default:
      return "aspect-[4/5] max-w-[34rem]";
  }
}

export default function EventCover({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const [shape, setShape] = useState<CoverShape>("unknown");

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setShape(classifyShape(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight));
  };

  return (
    <div className={`relative mx-auto w-full overflow-hidden rounded-[1.25rem] border border-zinc-800/80 bg-black shadow-2xl shadow-black/30 transition-[max-width,aspect-ratio] duration-300 ${frameClass(shape)}`} data-cover-shape={shape}>
      <Image
        src={src}
        alt=""
        fill
        aria-hidden="true"
        className="scale-110 object-cover opacity-45 blur-3xl saturate-75"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 80vw"
        quality={70}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_55%,rgba(0,0,0,0.72)_100%)]" />
      <div className="absolute inset-2 sm:inset-3 lg:inset-4">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)]"
          sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 88vw, 72vw"
          quality={92}
          priority={priority}
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
}
