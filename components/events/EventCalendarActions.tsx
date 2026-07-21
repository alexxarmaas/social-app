import { googleCalendarUrl } from "@/app/lib/event-calendar";
import { metadataBase } from "@/app/lib/seo";
import type { EventRecord } from "@/app/lib/tramassso-content";

export default function EventCalendarActions({ event }: { event: EventRecord }) {
  const data = {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    url: new URL(`/events/${event.id}`, metadataBase).toString(),
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a href={googleCalendarUrl(data)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-200 transition hover:border-white hover:bg-white hover:text-black">
        Google Calendar
      </a>
      <a href={`/api/events/${event.id}/calendar`} className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-200 transition hover:border-white hover:bg-white hover:text-black">
        Apple / Outlook (.ics)
      </a>
    </div>
  );
}
