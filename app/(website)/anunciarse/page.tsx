import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const metadata: Metadata = buildPremiumMetadata({
  title: "Publicidad y patrocinios en Tramassso",
  description: "Promociona tu taller, tienda de recambios o marca ante aficionados del motor con espacios destacados y colaboraciones.",
  path: "/anunciarse",
});

const options = [
  { title: "Colaborador destacado", text: "Un espacio identificado en Garage, Clubes o Inicio, con enlace medible hacia tu web." },
  { title: "Patrocina un encuentro", text: "Presencia en la ficha del evento y en las comunicaciones que acordemos para la comunidad." },
  { title: "Colaboracion a medida", text: "Acciones con contenido, marcas o servicios relacionados con la cultura del motor." },
];

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Marcas</p>
        <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase tracking-wide sm:text-7xl">Tu marca. Nuestra comunidad.</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">Si tu negocio vive del motor, Tramassso puede ayudarte a estar presente donde los entusiastas comparten sus coches, rutas y encuentros. Sin paquetes inflados ni cifras inventadas.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {options.map((option, index) => <article key={option.title} className="rounded-3xl border border-white/10 bg-zinc-900/60 p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">0{index + 1} / Formato</p>
            <h2 className="mt-5 text-xl font-black uppercase">{option.title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{option.text}</p>
          </article>)}
        </div>
        <section id="contact" className="mt-16 grid gap-10 rounded-3xl border border-orange-500/20 bg-[#140d0a] p-6 lg:grid-cols-2 lg:p-10">
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">Cuéntanos tu propuesta</p>
            <h2 className="mt-4 text-3xl font-black uppercase">Hablemos de colaboraciones.</h2>
            <p className="mt-5 text-sm leading-7 text-zinc-400">Los espacios se revisan individualmente. Podemos compartir métricas verificadas y acordar precio, ubicación y duración antes de publicar nada.</p>
            <Link href="/partners" className="mt-7 inline-block text-xs font-bold uppercase tracking-wide text-orange-400 underline">Ver marcas colaboradoras ↗</Link>
          </div>
          <ContactForm />
        </section>
        <p className="mt-6 text-xs leading-6 text-zinc-500">Las colaboraciones comerciales se identifican como publicidad cuando corresponde. Tramassso no garantiza ventas ni resultados publicitarios concretos.</p>
      </div>
    </main>
  );
}
