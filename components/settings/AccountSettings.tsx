"use client";

import { useState } from "react";
import { updatePassword, updateEmail } from "@/app/actions/settings";
import { toast } from "react-hot-toast";
import { MdSave, MdLock, MdEmail } from "react-icons/md";

export default function AccountSettings({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);

    const handlePasswordUpdate = async (formData: FormData) => {
        setLoading(true);
        const result = await updatePassword(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Contraseña actualizada correctamente");
            (document.getElementById("passwordForm") as HTMLFormElement).reset();
        }
    };

    const handleEmailUpdate = async (formData: FormData) => {
        setLoading(true);
        const result = await updateEmail(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Email actualizado correctamente");
        }
    };

    return (
        <div className="space-y-8">
            {/* Email Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MdEmail className="text-blue-500" /> Email
                </h3>
                <form action={handleEmailUpdate} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Email Actual</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={user.email}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-500 flex items-center gap-2 disabled:opacity-50"
                    >
                        <MdSave /> Guardar Email
                    </button>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MdLock className="text-red-500" /> Contraseña
                </h3>
                <form action={handlePasswordUpdate} id="passwordForm" className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Contraseña Actual</label>
                        <input
                            type="password"
                            name="currentPassword"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Nueva Contraseña</label>
                            <input
                                type="password"
                                name="newPassword"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Confirmar Contraseña</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-500 flex items-center gap-2 disabled:opacity-50"
                    >
                        <MdSave /> Actualizar Contraseña
                    </button>
                </form>
            </div>
        </div>
    );
}
