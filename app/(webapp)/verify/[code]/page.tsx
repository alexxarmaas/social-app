"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdCheckCircle, MdError, MdVerified } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function VerifyTicketPage() {
    const params = useParams();
    const code = params?.code as string;
    const { data: session, status } = useSession();
    const [attendee, setAttendee] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkInLoading, setCheckInLoading] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            if (status === 'loading') return;

            if (!session) {
                setError("Debes iniciar sesión para verificar entradas");
                setLoading(false);
                return;
            }

            if (!code) {
                setError("Código de entrada no válido");
                setLoading(false);
                return;
            }

            const result = await verifyTicketByCode(code);

            if (result.error) {
                setError(result.error);
            } else {
                setAttendee(result.attendee);
            }
            setLoading(false);
        };

        fetchTicket();
    }, [code, session, status]);

    const handleCheckIn = async () => {
        if (!attendee) return;
        setCheckInLoading(true);

        const result = await checkInAttendee(code, attendee.eventId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Asistente registrado correctamente");
            setAttendee({ ...attendee, checkedIn: true });
        }
        setCheckInLoading(false);
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6">
                    <MdError size={40} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Error de Verificación</h1>
                <p className="text-slate-400 mb-8">{error}</p>
                <Link href="/" className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                {/* Header */}
                <div className="bg-slate-900/50 p-6 text-center border-b border-slate-700">
                    <h1 className="text-xl font-bold text-white mb-1">Verificación de Entrada</h1>
                    <p className="text-slate-400 text-sm">Escanea para validar acceso</p>
                </div>

                {/* Attendee Info */}
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-700 mb-6 border-4 border-slate-600 shadow-xl">
                        {attendee.user.avatar ? (
                            <Image
                                src={attendee.user.avatar}
                                alt={attendee.user.username}
                                fill
                                className="object-fill"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-500">
                                {attendee.user.username[0].toUpperCase()}
                            </div>
                        )}
                        {attendee.checkedIn && (
                            <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center backdrop-blur-sm">
                                <MdCheckCircle size={48} className="text-white drop-shadow-lg" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1">{attendee.user.name || attendee.user.username}</h2>
                    <p className="text-slate-400 mb-6">@{attendee.user.username}</p>

                    <div className="w-full bg-slate-900/50 rounded-xl p-4 mb-8">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Evento</p>
                        <p className="text-white font-medium">{attendee.event.title}</p>
                    </div>

                    {attendee.checkedIn ? (
                        <div className="w-full bg-green-500/20 text-green-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                            <MdCheckCircle size={24} />
                            YA REGISTRADO
                        </div>
                    ) : (
                        <button
                            onClick={handleCheckIn}
                            disabled={checkInLoading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checkInLoading ? "Registrando..." : (
                                <>
                                    <MdVerified size={24} />
                                    PERMITIR ACCESO
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper to import server actions dynamically if needed, or just import directly
async function verifyTicketByCode(code: string) {
    const { verifyTicketByCode } = await import("@/app/actions/event");
    return verifyTicketByCode(code);
}

async function checkInAttendee(ticketCode: string, eventId: string) {
    const { checkInAttendee } = await import("@/app/actions/event");
    return checkInAttendee(ticketCode, eventId);
}
