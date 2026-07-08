import ProtectedLink from "@/components/ProtectedLink";
import { MdPhoneAndroid, MdFlashOn, MdNotifications, MdPhotoCamera, MdMap, MdChat } from "react-icons/md";
import WebsiteNav from "@/components/WebsiteNav";

export default function GetAppPage() {
    const features = [
        { icon: MdPhoneAndroid, title: "Llevalo contigo", description: "Funciona genial en tu teléfono mientras estás en el garaje" },
        { icon: MdFlashOn, title: "Velocidad", description: "Porque a nadie le gusta esperar" },
        { icon: MdNotifications, title: "Notificaciones", description: "Recibe alertas de eventos y mensajes (cuando tú quieras)" },
        { icon: MdPhotoCamera, title: "Compartir Fotos", description: "Muestra tu coche en alta resolución" },
        { icon: MdMap, title: "Encontrar Eventos", description: "Descubre quedadas y exposiciones cerca de ti" },
        { icon: MdChat, title: "Mensajes Directos", description: "Chatea con otros entusiastas en tiempo real" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
            {/* Navigation */}
            <WebsiteNav currentPage="get-app" />

            {/* Content */}
            <main className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-6xl mb-6 flex justify-center text-red-500"><MdPhoneAndroid size={64} /></div>
                    <h1 className="text-5xl font-bold text-white mb-4">Descarga Tramassso</h1>
                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
                        Lleva la comunidad de coches contigo. ¡Disponible pronto en iOS y Android!
                    </p>

                    {/* Download Buttons with Coming Soon */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <div className="relative">
                            <button
                                disabled
                                className="px-8 py-4 bg-slate-700 text-slate-400 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 cursor-not-allowed opacity-60"
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs">Descárgalo en el</div>
                                    <div className="font-bold">App Store</div>
                                </div>
                            </button>
                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Próximamente
                            </span>
                        </div>

                        <div className="relative">
                            <button
                                disabled
                                className="px-8 py-4 bg-slate-700 text-slate-400 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 cursor-not-allowed opacity-60"
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs">Consíguelo en</div>
                                    <div className="font-bold">Google Play</div>
                                </div>
                            </button>
                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Próximamente
                            </span>
                        </div>
                    </div>

                    <p className="text-slate-400 mb-12 text-sm">
                        Estamos trabajando duro para tener las apps listas. ¡Mientras tanto, usa la versión web!
                    </p>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                                <div className="text-4xl mb-4 text-red-500 flex justify-center"><feature.icon size={40} /></div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Web App Alternative */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                        <h2 className="text-2xl font-bold text-white mb-4">Usa la Web App Ahora</h2>
                        <p className="text-slate-300 mb-6">
                            ¿No quieres esperar? Puedes acceder a todo ahora mismo desde tu navegador.
                            Funciona en escritorio, tablet y móvil.
                        </p>
                        <ProtectedLink href="/events" className="inline-block px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all">
                            Ver Eventos →
                        </ProtectedLink>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                                Beta
                            </div>
                            <div className="text-slate-400 text-sm">Fase de Pruebas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                                Q1 2026
                            </div>
                            <div className="text-slate-400 text-sm">Lanzamiento Esperado</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                                50K+
                            </div>
                            <div className="text-slate-400 text-sm">Usuarios Web</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
