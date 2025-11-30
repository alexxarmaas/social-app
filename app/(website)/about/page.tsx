import Link from "next/link";
import { MdFlag, MdLightbulb } from "react-icons/md";
import WebsiteNav from "@/components/WebsiteNav";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
            {/* Navigation */}
            <WebsiteNav currentPage="about" />

            {/* Content */}
            <main className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-white mb-8">Sobre Tramassso</h1>

                    <div className="space-y-8 text-slate-300 text-lg">
                        <p>
                            Tramassso es la plataforma social definitiva para entusiastas del motor. Reunimos a amantes del automóvil de todo el mundo para compartir sus proyectos, conectar con personas afines y celebrar la cultura automotriz.
                        </p>

                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                            <h2 className="text-3xl font-bold text-white mb-4">Nuestra Misión</h2>
                            <p className="text-slate-300">
                                Crear la plataforma más completa y atractiva para entusiastas del motor, donde cada miembro pueda mostrar su pasión, aprender de otros y participar en la vibrante comunidad automotriz.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                                <div className="text-4xl mb-4 text-red-500 flex justify-center"><MdFlag size={40} /></div>
                                <h3 className="text-xl font-bold text-white mb-2">Nuestra Visión</h3>
                                <p className="text-slate-400">
                                    Ser la plataforma de referencia donde cada entusiasta del motor se sienta en casa, sin importar su preferencia automotriz.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                                <div className="text-4xl mb-4 text-red-500 flex justify-center"><MdLightbulb size={40} /></div>
                                <h3 className="text-xl font-bold text-white mb-2">Nuestros Valores</h3>
                                <p className="text-slate-400">
                                    Pasión, comunidad, autenticidad y respeto por todas las culturas y preferencias automotrices.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white">
                            <h2 className="text-3xl font-bold mb-4">Únete a Nuestra Comunidad</h2>
                            <p className="mb-6">
                                Ya sea que te gusten los JDM, el lujo europeo, el muscle americano o los vehículos eléctricos, Tramassso es tu hogar. ¡Únete a miles de entusiastas hoy!
                            </p>
                            <Link href="/feed" className="inline-block px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                                Empezar Ahora
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
