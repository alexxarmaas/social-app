"use client";

import { useState } from "react";
import { verifyTicket, checkInAttendee } from "@/app/actions/event";
import { toast } from "react-hot-toast";
import { MdCheckCircle, MdError, MdQrCodeScanner } from "react-icons/md";
import Image from "next/image";

import { useParams } from "next/navigation";

export default function ManageEventPage() {
    const params = useParams();
    const eventId = params?.id as string;
    const [ticketCode, setTicketCode] = useState("");
    const [attendee, setAttendee] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAttendee(null);

        const result = await verifyTicket(ticketCode, eventId);

        if (result.error) {
            toast.error(result.error);
        } else {
            setAttendee(result.attendee);
            toast.success("Entrada válida");
        }
        setLoading(false);
    };

    const handleCheckIn = async () => {
        if (!attendee) return;
        setCheckInLoading(true);

        const result = await checkInAttendee(ticketCode, eventId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Asistente registrado correctamente");
            setAttendee({ ...attendee, checkedIn: true });
            setTicketCode("");
            // Optional: clear attendee after delay or keep showing success
        }
        setCheckInLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Gestionar Evento</h1>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                        <MdQrCodeScanner size={24} />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Verificar Entrada</h2>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Código de Entrada
                        </label>
                        <input
                            type="text"
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value)}
                            placeholder="Ingrese el código UUID..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !ticketCode}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? "Verificando..." : "Verificar"}
                    </button>
                </form>
            </div>

            {attendee && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-700">
                            {attendee.user.avatar ? (
                                <Image
                                    src={attendee.user.avatar}
                                    alt={attendee.user.username}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                                    {attendee.user.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{attendee.user.name || attendee.user.username}</h3>
                            <p className="text-slate-400">@{attendee.user.username}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${attendee.checkedIn ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {attendee.checkedIn ? <MdCheckCircle size={24} /> : <MdError size={24} />}
                            <span className="font-medium">
                                {attendee.checkedIn ? "Ya ha entrado" : "Pendiente de entrada"}
                            </span>
                        </div>

                        {!attendee.checkedIn && (
                            <button
                                onClick={handleCheckIn}
                                disabled={checkInLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {checkInLoading ? "Registrando..." : (
                                    <>
                                        <MdCheckCircle size={20} />
                                        Registrar Entrada
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
