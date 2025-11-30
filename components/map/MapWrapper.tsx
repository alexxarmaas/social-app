"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-aeroblade tracking-wide">Cargando Mapa...</p>
            </div>
        </div>
    )
});

interface MapWrapperProps {
    events: any[];
    stores: any[];
}

export default function MapWrapper({ events, stores }: MapWrapperProps) {
    return <Map events={events} stores={stores} />;
}
