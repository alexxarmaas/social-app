"use client";

import { useState } from "react";
import CreateEventModal from "./CreateEventModal";
import { MdAdd } from "react-icons/md";

export default function CreateEventButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center gap-2"
            >
                <MdAdd size={20} />
                <span className="hidden sm:inline">Crear Evento</span>
            </button>

            <CreateEventModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
