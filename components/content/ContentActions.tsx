"use client";

import { track } from "@vercel/analytics/react";
import { useState } from "react";
import { MdCalendarMonth, MdContentCopy, MdLocationOn, MdShare } from "react-icons/md";

interface ContentActionsProps {
  title: string;
  location: string;
  date?: string;
  kind: "event" | "route";
}

function calendarData(title: string, location: string, date: string) {
  const start = new Date(date);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const format = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tramassso//Eventos//ES", "BEGIN:VEVENT", `DTSTART:${format(start)}`, `DTEND:${format(end)}`, `SUMMARY:${escape(title)}`, `LOCATION:${escape(location)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}

export default function ContentActions({ title, location, date, kind }: ContentActionsProps) {
  const [copied, setCopied] = useState(false);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  const calendarUrl = date ? `data:text/calendar;charset=utf-8,${encodeURIComponent(calendarData(title, location, date))}` : null;

  async function share() {
    track("Content_Share", { kind, title });
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Cancelar el dialogo nativo de compartir no requiere mostrar un error.
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={mapsUrl} target="_blank" rel="noreferrer" onClick={() => track("Maps_Click", { kind, title })} className="racing-button inline-flex items-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"><MdLocationOn className="mr-2" />Cómo llegar</a>
      {calendarUrl ? <a href={calendarUrl} download={`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`} className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]"><MdCalendarMonth className="mr-2" />Calendario</a> : null}
      <button type="button" onClick={() => void share()} className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]">{copied ? <MdContentCopy className="mr-2" /> : <MdShare className="mr-2" />}{copied ? "Copiado" : "Compartir"}</button>
    </div>
  );
}
