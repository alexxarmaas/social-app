import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { deleteEventRegistration, registrationStatusSchema, updateEventRegistration } from "@/app/lib/event-registrations";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";
import { sendRegistrationStatusNotification } from "@/app/lib/contact-email";

async function authorize(request: NextRequest) {
  if (!(await getCurrentAdminSession())) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  const limit = checkRateLimit(`admin-event-registrations:${requestIdentifier(request.headers)}`, 50, 60_000);
  return limit.allowed ? null : NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
}

export async function PATCH(request: NextRequest) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body: { id?: string; status?: unknown } = await request.json();
  const status = registrationStatusSchema.safeParse(body.status);
  if (!body.id || !status.success) return NextResponse.json({ error: "Datos no validos." }, { status: 400 });
  const result = await updateEventRegistration(body.id, status.data);
  revalidatePath("/admin");
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  const notification = result.notification ? await sendRegistrationStatusNotification(result.notification) : null;
  return NextResponse.json({ success: true, notification: notification?.delivered ? "delivered" : "pending" });
}

export async function DELETE(request: NextRequest) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body: { id?: string } = await request.json();
  if (!body.id) return NextResponse.json({ error: "Datos no validos." }, { status: 400 });
  const result = await deleteEventRegistration(body.id);
  revalidatePath("/admin");
  return "error" in result ? NextResponse.json(result, { status: 400 }) : NextResponse.json(result);
}
