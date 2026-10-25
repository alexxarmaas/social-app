export type OnboardingProgress = {
  hasBio: boolean;
  carCount: number;
  membershipCount: number;
  ownedClubCount: number;
  approvedPostCount: number;
  socialEnabled: boolean;
};

export type OnboardingStep = {
  id: "profile" | "garage" | "club" | "social";
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
};

export function buildOnboardingSteps(progress: OnboardingProgress): OnboardingStep[] {
  const steps: OnboardingStep[] = [
    {
      id: "profile",
      title: "Dale personalidad a tu perfil",
      description: "Cuenta qué coches te gustan y desde qué zona disfrutas del motor.",
      href: "/account", cta: "Completar perfil",
      done: progress.hasBio,
    },
    {
      id: "garage",
      title: "Presenta tu primer coche",
      description: "Publica su ficha, añade fotos y consigue un enlace para compartir.",
      href: "/garage/new", cta: "Añadir coche",
      done: progress.carCount > 0,
    },
    {
      id: "club",
      title: "Conecta con un club",
      description: "Únete a un grupo de tu estilo o crea tu propio club de motor.",
      href: "/clubs", cta: "Explorar clubes",
      done: progress.membershipCount + progress.ownedClubCount > 0,
    },
  ];
  if (progress.socialEnabled) steps.push({
    id: "social",
    title: "Comparte algo con la comunidad",
    description: "Publica tus avances y conoce a otros aficionados al motor.",
    href: "/community", cta: "Ir al muro",
    done: progress.approvedPostCount > 0,
  });
  return steps;
}
