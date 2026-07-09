import ProtectedLink from "@/components/ProtectedLink";
import { MdFlag, MdLightbulb } from "react-icons/md";

export default function AboutPage() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
            {/* Contenido */}
            <main className="container mx-auto px-4 py-12 sm:py-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="mb-8 text-3xl font-bold text-white sm:text-4xl">Sobre Tramassso</h1>

                    <div className="space-y-6 text-base leading-7 text-slate-300 sm:space-y-8 sm:text-lg">
                        <p>
                            Tramassso es la plataforma social definitiva para entusiastas del motor. Reunimos a amantes del automóvil de todo el mundo para compartir sus proyectos, conectar con personas afines y celebrar la cultura automotriz.
                        </p>

                        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5 backdrop-blur-sm sm:p-8">
                            <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Nuestro objetivo</h2>
                            <p className="text-slate-300">
                                Crear la plataforma más completa y atractiva para entusiastas del motor, donde cada miembro pueda mostrar su pasión, aprender de otros y participar en la vibrante comunidad automotriz.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                                <div className="text-4xl mb-4 text-red-500 flex justify-center"><MdFlag size={40} /></div>
                                <h3 className="text-xl font-bold text-white mb-2">Nuestra meta</h3>
                                <p className="text-slate-400">
                                    Ser la plataforma de referencia donde cada entusiasta del motor se sienta en casa, sin importar su preferencia automotriz.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                                <div className="text-4xl mb-4 text-red-500 flex justify-center"><MdLightbulb size={40} /></div>
                                <h3 className="text-xl font-bold text-white mb-2">Nuestros valores</h3>
                                <p className="text-slate-400">
                                    Pasión, comunidad, autenticidad y respeto por todas las culturas y preferencias automotrices.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white sm:p-8">
                            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Forma parte de nuestra comunidad</h2>
                            <p className="mb-6">
                                Ya sea que te gusten los JDM, el lujo europeo, el muscle americano o los vehículos eléctricos, Tramassso es tu hogar. ¡Únete a miles de entusiastas hoy!
                            </p>
                            <ProtectedLink href="/events" className="inline-block w-full rounded-full border border-white/15 bg-black px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:border-white hover:bg-zinc-900 sm:w-auto sm:tracking-[0.32em]">
                                Ver eventos
                            </ProtectedLink>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
