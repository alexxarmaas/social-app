import Link from "next/link";
import RecceMindCarMode from "@/components/reccemind/RecceMindCarMode";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ stage?: string | string[] }>;
};

export default async function RecceMindCarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const stage = Array.isArray(params.stage) ? params.stage[0] : params.stage;
  const stageId = stage?.slice(0, 80) || "";

  if (!stageId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-dashed border-zinc-800 bg-white/[0.02] p-8 text-center">
        <div className="max-w-md">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">Modo coche</p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-200">Elige un tramo guardado</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600">El copiloto GPS y el dictado geolocalizado trabajan sobre una versión guardada para no perder cambios durante el reconocimiento.</p>
          <Link href="/reccemind/tramos" className="mt-5 inline-block rounded-xl bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">Abrir Mis tramos</Link>
        </div>
      </div>
    );
  }

  return <RecceMindCarMode stageId={stageId} />;
}
