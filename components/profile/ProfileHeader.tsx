"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import { signOut } from "next-auth/react";

export default function ProfileHeader({ user }: { user: any }) {
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <div className="flex gap-3 mt-4">
            <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all"
            >
                Editar Perfil
            </button>
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
            >
                Cerrar Sesión
            </button>

            {showEditModal && (
                <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
            )}
        </div>
    );
}
