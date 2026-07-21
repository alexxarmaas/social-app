import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactRequestInputSchema, createContactRequest } from "@/app/lib/tramassso-content";
import { sendContactNotification } from "@/app/lib/contact-email";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`contact:${requestIdentifier(request.headers)}`, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Has enviado demasiadas solicitudes. Intentalo mas tarde." }, { status: 429 });
  }

  try {
    const body = contactRequestInputSchema.parse(await request.json());
    if (body.website) return NextResponse.json({ success: true }, { status: 201 });

    const result = await createContactRequest(body);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    const notification = await sendContactNotification(body);
    return NextResponse.json({ ...result, notification: notification.delivered ? "delivered" : "pending" }, { status: 201 });
  } catch (error) {
    const message = error instanceof ZodError
      ? error.issues.map((issue) => issue.message).join(" ")
      : "No se pudo procesar la solicitud.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
