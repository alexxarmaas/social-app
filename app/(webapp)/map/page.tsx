import { getEvents } from "@/app/actions/event";
import { getStores } from "@/app/actions/store";
import MapWrapper from "@/components/map/MapWrapper";

export default async function MapPage() {
    const { events } = await getEvents();
    const { stores } = await getStores();

    // Filter events and stores that have coordinates
    const mapEvents = events?.filter(e => e.latitude && e.longitude) || [];
    const mapStores = stores?.filter(s => s.latitude && s.longitude) || [];

    return (
        <div className="h-[calc(100vh-80px)] w-full relative">
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl max-w-xs">
                <h1 className="text-2xl font-bold text-white font-aeroblade tracking-wide mb-2">Mapa</h1>
                <p className="text-sm text-slate-400 mb-2">
                    Explora eventos y tiendas en tu zona.
                </p>
                <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-slate-300">Eventos ({mapEvents.length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-slate-300">Tiendas ({mapStores.length})</span>
                    </div>
                </div>
            </div>

            <MapWrapper events={mapEvents} stores={mapStores} />
        </div>
    );
}
