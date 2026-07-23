"use client";

import { track } from "@vercel/analytics/react";
import { useState } from "react";
import { MdCalendarMonth, MdContentCopy, MdLocationOn, MdShare } from "react-icons/md";

interface ContentActionsProps {
  title: string;
  location: string;
  kind: "event" | "route";
  contentId?: string;
}

export default function ContentActions({ title, location, kind, contentId }: ContentActionsProps) {
  const [copied, setCopied] = useState(false);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  const calendarUrl = kind === "event" && contentId ? `/api/events/${contentId}/calendar` : null;

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
      {calendarUrl ? (
        <a
          href={calendarUrl}
          onClick={() => track("Calendar_Download", { kind, title })}
          className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] transition hover:border-white hover:bg-white hover:text-black"
        >
          <MdCalendarMonth className="mr-2" />Calendario
        </a>
      ) : null}
      <button type="button" onClick={() => void share()} className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] transition hover:border-white hover:bg-white hover:text-black">{copied ? <MdContentCopy className="mr-2" /> : <MdShare className="mr-2" />}{copied ? "Copiado" : "Compartir"}</button>
    </div>
  );
}
