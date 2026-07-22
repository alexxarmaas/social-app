import Image from "next/image";

type PartnerLogoVariant = "card" | "detail" | "preview" | "thumbnail";

interface PartnerLogoProps {
  src?: string | null;
  alt: string;
  variant?: PartnerLogoVariant;
  priority?: boolean;
  className?: string;
}

interface VariantConfig {
  frame: string;
  foreground: string;
  sizes: string;
  showBackdrop: boolean;
}

const variantConfig: Record<PartnerLogoVariant, VariantConfig> = {
  card: {
    frame: "h-36 rounded-[1.25rem] sm:h-40",
    foreground: "inset-4 sm:inset-5",
    sizes: "(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) calc(50vw - 4rem), 350px",
    showBackdrop: true,
  },
  detail: {
    frame: "min-h-[15rem] sm:min-h-[19rem] lg:min-h-[22rem]",
    foreground: "inset-6 sm:inset-10 lg:inset-12",
    sizes: "(max-width: 1023px) calc(100vw - 7rem), 800px",
    showBackdrop: true,
  },
  preview: {
    frame: "h-40 rounded-3xl sm:h-48",
    foreground: "inset-5 sm:inset-7",
    sizes: "(max-width: 1279px) calc(100vw - 5rem), 420px",
    showBackdrop: true,
  },
  thumbnail: {
    frame: "h-14 w-14 shrink-0 rounded-2xl",
    foreground: "inset-2",
    sizes: "56px",
    showBackdrop: false,
  },
};

function buildLogoUrl(src: string): string {
  try {
    const url = new URL(src);

    if (url.hostname !== "res.cloudinary.com" || !url.pathname.includes("/image/upload/")) {
      return src;
    }

    url.pathname = url.pathname.replace(
      "/image/upload/",
      "/image/upload/e_trim:10/c_limit,w_1600,h_1000,q_auto:best/",
    );

    return url.toString();
  } catch {
    return src;
  }
}

export default function PartnerLogo({
  src,
  alt,
  variant = "card",
  priority = false,
  className = "",
}: PartnerLogoProps) {
  const config = variantConfig[variant];
  const optimizedSrc = src ? buildLogoUrl(src) : null;

  return (
    <div
      className={`relative isolate overflow-hidden border border-zinc-800 bg-zinc-950 ${config.frame} ${className}`}
    >
      {optimizedSrc ? (
        <>
          {config.showBackdrop ? (
            <>
              <Image
                src={optimizedSrc}
                alt=""
                fill
                aria-hidden="true"
                className="scale-110 object-cover opacity-25 blur-2xl"
                sizes={config.sizes}
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/80" />
            </>
          ) : null}

          <div className={`absolute ${config.foreground}`}>
            <Image
              src={optimizedSrc}
              alt={alt}
              fill
              className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
              sizes={config.sizes}
              quality={90}
              priority={priority}
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
