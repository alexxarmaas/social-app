import { NextResponse } from "next/server";
import { getPublicEventById } from "@/app/lib/tramassso-content";
import { createEventIcs } from "@/app/lib/event-calendar";
import { metadataBase } from "@/app/lib/seo";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { event } = await getPublicEventById(id);
  if (!event) return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });

  const body = createEventIcs({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    url: new URL(`/events/${event.id}`, metadataBase).toString(),
  });
  const safeId = id.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80) || "evento";
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="tramassso-evento-${safeId}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
