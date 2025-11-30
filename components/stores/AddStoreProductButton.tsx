"use client";

import { useState } from "react";
import AddStoreProductModal from "./AddStoreProductModal";
import { MdAddBox } from "react-icons/md";

export default function AddStoreProductButton({ store }: { store: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 flex items-center gap-2 transition-all"
            >
                <MdAddBox size={20} />
                Añadir Producto
            </button>
            <AddStoreProductModal store={store} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
