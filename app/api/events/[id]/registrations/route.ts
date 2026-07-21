import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createEventRegistration } from "@/app/lib/event-registrations";
import { sendRegistrationNotification } from "@/app/lib/contact-email";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const limit = checkRateLimit(`event-registration:${requestIdentifier(request.headers)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Has enviado demasiadas solicitudes. Intentalo mas tarde." }, { status: 429 });
  }

  try {
    const { id } = await context.params;
    const result = await createEventRegistration(id, await request.json());
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    if (!result.event || !result.input) return NextResponse.json({ success: true }, { status: 201 });

    const notification = await sendRegistrationNotification(result.input, {
      title: result.event.title,
      date: result.event.date,
      location: result.event.location,
      participation_mode: result.event.participation_mode as "interest" | "managed",
    });
    return NextResponse.json({ success: true, notification: notification.delivered ? "delivered" : "pending" }, { status: 201 });
  } catch (error) {
    const message = error instanceof ZodError
      ? error.issues.map((issue) => issue.message).join(" ")
      : "No se pudo procesar la solicitud.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
