import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { deleteContactRequest, updateContactRequest, type ContactRequestRecord } from "@/app/lib/tramassso-content";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";

const validStatuses = new Set<ContactRequestRecord["status"]>(["nuevo", "visto", "respondido"]);

async function authorize(request: NextRequest) {
  if (!(await getCurrentAdminSession())) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  const limit = checkRateLimit(`admin-contacts:${requestIdentifier(request.headers)}`, 40, 60_000);
  return limit.allowed ? null : NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
}

export async function PATCH(request: NextRequest) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body: { id?: string; status?: ContactRequestRecord["status"] } = await request.json();
  if (!body.id || !body.status || !validStatuses.has(body.status)) return NextResponse.json({ error: "Datos no validos." }, { status: 400 });
  const result = await updateContactRequest(body.id, body.status);
  revalidatePath("/admin");
  return "error" in result ? NextResponse.json(result, { status: 400 }) : NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body: { id?: string } = await request.json();
  if (!body.id) return NextResponse.json({ error: "Datos no validos." }, { status: 400 });
  const result = await deleteContactRequest(body.id);
  revalidatePath("/admin");
  return "error" in result ? NextResponse.json(result, { status: 400 }) : NextResponse.json(result);
}
