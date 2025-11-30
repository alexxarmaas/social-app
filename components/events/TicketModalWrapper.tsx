"use client";

import { useState, useEffect } from "react";
import TicketModal from "./TicketModal";

export default function TicketModalWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState<{ event: any, ticketCode: string } | null>(null);

    useEffect(() => {
        const handleOpenTicket = (e: CustomEvent) => {
            setModalData(e.detail);
            setIsOpen(true);
        };

        window.addEventListener('openTicketModal', handleOpenTicket as EventListener);

        return () => {
            window.removeEventListener('openTicketModal', handleOpenTicket as EventListener);
        };
    }, []);

    if (!modalData) return null;

    return (
        <TicketModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            event={modalData.event}
            ticketCode={modalData.ticketCode}
        />
    );
}
