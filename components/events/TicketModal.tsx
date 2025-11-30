"use client";

import { MdClose, MdQrCode, MdDownload } from "react-icons/md";
import QRCode from "react-qr-code";
import { useRef } from "react";

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
    ticketCode: string;
}

export default function TicketModal({ isOpen, onClose, event, ticketCode }: TicketModalProps) {
    if (!isOpen || !event) return null;

    const date = new Date(event.startDate);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-black rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                {/* Header Pattern */}
                <div className="h-32 bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-500 via-slate-900 to-black"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-white font-aeroblade text-2xl tracking-wider">TRAMASSSO</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Ticket Body */}
                <div className="px-6 py-8 text-center relative">
                    {/* Cutout Circles */}
                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/90 rounded-full"></div>
                    <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/90 rounded-full"></div>

                    <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                    <p className="text-slate-500 text-sm mb-6">{event.location}</p>

                    <div className="flex justify-center gap-8 mb-8 border-b border-dashed border-slate-200 pb-8">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Fecha</p>
                            <p className="font-bold">{date.toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Hora</p>
                            <p className="font-bold">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Precio</p>
                            <p className="font-bold">{event.price > 0 ? `${event.price}€` : "Gratis"}</p>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white border-4 border-slate-900 rounded-xl">
                            <QRCode
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${ticketCode}`}
                                size={180}
                                level="H"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-6">{ticketCode}</p>

                    <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-500">
                        Presenta este código QR en la entrada del evento para acceder.
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-900 p-4 text-center">
                    <p className="text-slate-500 text-xs">Tramassso Events</p>
                </div>
            </div>
        </div>
    );
}
