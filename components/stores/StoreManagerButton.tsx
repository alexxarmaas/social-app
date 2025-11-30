"use client";

import { useState } from "react";
import EditStoreModal from "./EditStoreModal";
import { MdSettings } from "react-icons/md";

export default function StoreManagerButton({ store }: { store: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white rounded-lg font-semibold hover:bg-slate-800 border border-slate-700 flex items-center gap-2 transition-all shadow-lg"
            >
                <MdSettings className="text-red-500" />
                Gestionar Tienda
            </button>
            <EditStoreModal store={store} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
