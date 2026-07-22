"use client";

import Image from "next/image";
import { useState, type SyntheticEvent } from "react";

type PartnerLogoVariant = "card" | "detail" | "preview" | "thumbnail";
type PartnerLogoShape = "unknown" | "wide" | "landscape" | "square" | "portrait";
type PartnerLogoPresentation = "default" | "blend-dark";

interface PartnerLogoProps {
  src?: string | null;
  alt: string;
  variant?: PartnerLogoVariant;
  priority?: boolean;
  className?: string;
}

interface VariantConfig {
  frame: string;
  sizes: string;
  showBackdrop: boolean;
}

const PRESENTATION_PARAM = "tramassso_logo";

const variantConfig: Record<PartnerLogoVariant, VariantConfig> = {
  card: {
    frame: "h-40 rounded-[1.25rem] sm:h-44",
    sizes: "(max-width: 767px) calc(100vw - 3rem), (max-width: 1279px) calc(50vw - 3rem), 370px",
    showBackdrop: true,
  },
  detail: {
    frame: "mx-auto aspect-square w-full max-w-[28rem] transition-[max-width,aspect-ratio] duration-300",
    sizes: "(max-width: 640px) calc(100vw - 3rem), (max-width: 1023px) 70vw, 800px",
    showBackdrop: true,
  },
  preview: {
    frame: "h-44 rounded-3xl sm:h-52",
    sizes: "(max-width: 1279px) calc(100vw - 4rem), 440px",
    showBackdrop: true,
  },
  thumbnail: {
    frame: "h-14 w-14 shrink-0 rounded-2xl",
    sizes: "56px",
    showBackdrop: false,
  },
};

function parseLogoUrl(src: string): URL | null {
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

function canBlendPartnerLogo(src?: string | null): boolean {
  if (!src) {
    return false;
  }

  const url = parseLogoUrl(src);
  return url?.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
}

function getRequestedPresentation(src?: string | null): PartnerLogoPresentation {
  if (!src) {
    return "default";
  }

  const url = parseLogoUrl(src);
  return url?.searchParams.get(PRESENTATION_PARAM) === "blend-dark" ? "blend-dark" : "default";
}

function stripPresentationMarker(src: string): string {
  const url = parseLogoUrl(src);

  if (!url) {
    return src;
  }

  url.searchParams.delete(PRESENTATION_PARAM);
  return url.toString();
}

function buildForegroundUrl(src: string, presentation: PartnerLogoPresentation): string {
  const cleanSrc = stripPresentationMarker(src);
  const url = parseLogoUrl(cleanSrc);

  if (!url || url.hostname !== "res.cloudinary.com" || !url.pathname.includes("/image/upload/")) {
    return cleanSrc;
  }

  const backgroundTransform = presentation === "blend-dark" ? "e_make_transparent:22/f_png/" : "";
  url.pathname = url.pathname.replace(
    "/image/upload/",
    `/image/upload/${backgroundTransform}e_trim:10/c_limit,w_1600,h_1000,q_auto:best/`,
  );

  return url.toString();
}

function buildBackdropUrl(src: string): string {
  const cleanSrc = stripPresentationMarker(src);
  const url = parseLogoUrl(cleanSrc);

  if (!url || url.hostname !== "res.cloudinary.com" || !url.pathname.includes("/image/upload/")) {
    return cleanSrc;
  }

  url.pathname = url.pathname.replace(
    "/image/upload/",
    "/image/upload/c_fill,w_1200,h_800,q_auto:eco,e_blur:250/",
  );

  return url.toString();
}

function classifyLogoShape(width: number, height: number): PartnerLogoShape {
  if (width <= 0 || height <= 0) {
    return "unknown";
  }

  const ratio = width / height;

  if (ratio >= 1.8) {
    return "wide";
  }
  if (ratio >= 1.18) {
    return "landscape";
  }
  if (ratio >= 0.82) {
    return "square";
  }

  return "portrait";
}

function hasDarkOpaqueEdges(image: HTMLImageElement): boolean {
  try {
    const sampleSize = 64;
    const edgeDepth = 5;
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return false;
    }

    context.drawImage(image, 0, 0, sampleSize, sampleSize);
    const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
    let edgePixels = 0;
    let transparentPixels = 0;
    let opaquePixels = 0;
    let darkNeutralPixels = 0;

    for (let y = 0; y < sampleSize; y += 1) {
      for (let x = 0; x < sampleSize; x += 1) {
        const isEdge = x < edgeDepth || y < edgeDepth || x >= sampleSize - edgeDepth || y >= sampleSize - edgeDepth;
        if (!isEdge) {
          continue;
        }

        const index = (y * sampleSize + x) * 4;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const alpha = pixels[index + 3];
        edgePixels += 1;

        if (alpha < 48) {
          transparentPixels += 1;
          continue;
        }

        opaquePixels += 1;
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);

        if (luminance < 82 && chroma < 72) {
          darkNeutralPixels += 1;
        }
      }
    }

    if (edgePixels === 0 || transparentPixels / edgePixels > 0.2 || opaquePixels === 0) {
      return false;
    }

    return opaquePixels / edgePixels > 0.82 && darkNeutralPixels / opaquePixels > 0.68;
  } catch {
    return false;
  }
}

function getDetailFrame(shape: PartnerLogoShape): string {
  switch (shape) {
    case "wide":
      return "aspect-[16/7] max-w-none";
    case "landscape":
      return "aspect-[4/3] max-w-3xl";
    case "portrait":
      return "aspect-[4/5] max-w-[24rem]";
    case "square":
    case "unknown":
    default:
      return "aspect-square max-w-[28rem]";
  }
}

function getForegroundFrame(variant: PartnerLogoVariant, shape: PartnerLogoShape): string {
  if (variant === "thumbnail") {
    return "inset-2";
  }

  if (variant === "detail") {
    if (shape === "wide") {
      return "inset-5 sm:inset-8 lg:inset-10";
    }
    if (shape === "landscape") {
      return "inset-4 sm:inset-6 lg:inset-8";
    }

    return "inset-3 sm:inset-4 lg:inset-5";
  }

  if (shape === "square" || shape === "portrait") {
    return variant === "card" ? "inset-2 sm:inset-3" : "inset-3 sm:inset-4";
  }

  return variant === "card" ? "inset-4 sm:inset-5" : "inset-5 sm:inset-7";
}

function PartnerLogoContent({
  src,
  alt,
  variant = "card",
  priority = false,
  className = "",
}: PartnerLogoProps) {
  const [shape, setShape] = useState<PartnerLogoShape>("unknown");
  const [autoBlendDark, setAutoBlendDark] = useState(false);
  const [autoBlendFailed, setAutoBlendFailed] = useState(false);
  const config = variantConfig[variant];
  const requestedPresentation = getRequestedPresentation(src);
  const presentation = requestedPresentation === "blend-dark" || autoBlendDark ? "blend-dark" : "default";
  const foregroundSrc = src ? buildForegroundUrl(src, presentation) : null;
  const backdropSrc = src ? buildBackdropUrl(src) : null;
  const detailFrame = variant === "detail" ? getDetailFrame(shape) : "";
  const foregroundFrame = getForegroundFrame(variant, shape);
  const softenSquareEdges = presentation === "default" && variant !== "thumbnail" && (shape === "square" || shape === "portrait");
  const edgeMask = "radial-gradient(ellipse 80% 80% at center, #000 68%, rgba(0,0,0,0.97) 78%, transparent 100%)";

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const nextShape = classifyLogoShape(image.naturalWidth, image.naturalHeight);
    setShape(nextShape);

    if (
      requestedPresentation === "default"
      && !autoBlendDark
      && !autoBlendFailed
      && canBlendPartnerLogo(src)
      && (nextShape === "square" || nextShape === "portrait")
      && hasDarkOpaqueEdges(image)
    ) {
      setAutoBlendDark(true);
    }
  };

  const handleImageError = () => {
    if (requestedPresentation === "default" && autoBlendDark) {
      setAutoBlendFailed(true);
      setAutoBlendDark(false);
    }
  };

  return (
    <div
      className={`relative isolate overflow-hidden border border-zinc-800 bg-black ${config.frame} ${detailFrame} ${className}`}
      data-logo-shape={shape}
      data-logo-presentation={presentation}
    >
      {foregroundSrc ? (
        <>
          {config.showBackdrop && backdropSrc ? (
            <>
              <Image
                src={backdropSrc}
                alt=""
                fill
                aria-hidden="true"
                className="scale-110 object-cover opacity-50 blur-2xl saturate-75"
                sizes={config.sizes}
                quality={75}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/25 to-black/65" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_52%,rgba(0,0,0,0.7)_100%)]" />
            </>
          ) : null}

          <div
            className={`absolute ${foregroundFrame}`}
            style={softenSquareEdges ? { WebkitMaskImage: edgeMask, maskImage: edgeMask } : undefined}
          >
            <Image
              src={foregroundSrc}
              alt={alt}
              fill
              className="object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)]"
              sizes={config.sizes}
              quality={92}
              priority={priority}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <span className="font-aeroblade text-xl tracking-[0.18em] text-zinc-700 sm:text-2xl">
            Tramassso
          </span>
        </div>
      )}
    </div>
  );
}

export default function PartnerLogo(props: PartnerLogoProps) {
  return <PartnerLogoContent key={props.src ?? "empty-logo"} {...props} />;
}
