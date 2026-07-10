import ProtectedLink from "@/components/ProtectedLink";
import { MdPerson } from "react-icons/md";

export default function WhoAreWePage() {
    const team = [
        { name: "Alejandro Armas", role: "Fundador y CEO", icon: MdPerson, specialty: "Entusiasta JDM" },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
            {/* Contenido */}
            <main className="container mx-auto px-4 py-12 sm:py-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="mb-8 text-4xl font-bold text-white sm:text-5xl">Tramassso</h1>

                    <div className="space-y-8">
                        <p className="text-base leading-7 text-slate-300 sm:text-lg">
                            Somos un equipo de apasionados entusiastas del motor que querian crear una plataforma que realmente entienda y celebre la cultura automotriz. Desde sesiones nocturnas en el garaje hasta dias de pista de fin de semana, vivimos y respiramos coches.
                        </p>

                        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5 backdrop-blur-sm sm:p-8">
                            <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Nuestra historia</h2>
                            <p className="text-slate-300 mb-4">
                                Tramassso nacio de una idea simple: los entusiastas del motor necesitaban un espacio dedicado para conectar, compartir y crecer juntos. Lo que comenzo como encuentros de fin de semana en estacionamientos ha evolucionado a una comunidad que cada dia va en aumento.
                            </p>
                            <p className="text-slate-300">
                                Hemos construido esta plataforma con la misma atencion al detalle que aplicamos a nuestras propias construcciones: cada funcion, cada interaccion, creada pensando en la comunidad automotriz.
                            </p>
                        </div>

                        <h2 className="mb-6 mt-12 text-2xl font-bold text-white sm:text-3xl">Conoce al equipo</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {team.map((member, index) => (
                                <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-red-500 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                                            <member.icon size={32} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                                            <p className="text-red-400 font-semibold">{member.role}</p>
                                            <p className="text-slate-400 text-sm mt-2">{member.specialty}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white sm:p-8">
                            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Forma parte de nuestra comunidad</h2>
                            <p className="mb-6">
                                Siempre buscamos personas apasionadas para unirse a nuestra comunidad. Ya sea como miembro o parte de nuestro equipo, hay un lugar para ti en Tramassso.
                            </p>
                            <div className="grid gap-3 sm:flex sm:gap-4">
                                <ProtectedLink href="/events" className="rounded-full border border-white/15 bg-black px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:border-white hover:bg-zinc-900 sm:tracking-[0.32em]">
                                    Ver Eventos
                                </ProtectedLink>
                                <ProtectedLink href="/about" className="rounded-full bg-slate-900 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-slate-800">
                                    Sobre Tramassso
                                </ProtectedLink>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
