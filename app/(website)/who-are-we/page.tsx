import ProtectedLink from "@/components/ProtectedLink";
import { MdPerson } from "react-icons/md";

export default function WhoAreWePage() {
    const team = [
        { name: "Alejandro Armas", role: "Fundador y CEO", icon: MdPerson, specialty: "Entusiasta JDM" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
            {/* Contenido */}
            <main className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-white mb-8">Tramassso</h1>

                    <div className="space-y-8">
                        <p className="text-slate-300 text-lg">
                            Somos un equipo de apasionados entusiastas del motor que querían crear una plataforma que realmente entienda y celebre la cultura automotriz. Desde sesiones nocturnas en el garaje hasta días de pista de fin de semana, vivimos y respiramos coches.
                        </p>

                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                            <h2 className="text-3xl font-bold text-white mb-6">Nuestra historia</h2>
                            <p className="text-slate-300 mb-4">
                                Tramassso nació de una idea simple: los entusiastas del motor necesitaban un espacio dedicado para conectar, compartir y crecer juntos. Lo que comenzó como encuentros de fin de semana en estacionamientos ha evolucionado a una comunidad que cada día va en aumento.
                            </p>
                            <p className="text-slate-300">
                                Hemos construido esta plataforma con la misma atención al detalle que aplicamos a nuestras propias construcciones: cada función, cada interacción, diseñada pensando en la comunidad automotriz.
                            </p>
                        </div>

                        <h2 className="text-3xl font-bold text-white mt-12 mb-6">Conoce al equipo</h2>

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

                        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white mt-12">
                            <h2 className="text-3xl font-bold mb-4">Forma parte de nuestra comunidad</h2>
                            <p className="mb-6">
                                Siempre buscamos personas apasionadas para unirse a nuestra comunidad. Ya sea como miembro o parte de nuestro equipo, hay un lugar para ti en Tramassso.
                            </p>
                            <div className="flex gap-4">
                                <ProtectedLink href="/events" className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                                    Ver Eventos
                                </ProtectedLink>
                                <ProtectedLink href="/about" className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors">
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
