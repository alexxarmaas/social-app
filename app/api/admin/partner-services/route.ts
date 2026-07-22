import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { listAdminPartnerServices, partnerIdSchema, replacePartnerServices } from "@/app/lib/partner-services";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";

async function requireAdmin() {
  return getCurrentAdminSession();
}

function errorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado.";
}

function enforceWriteLimit(request: NextRequest) {
  const result = checkRateLimit(`admin-partner-services:${requestIdentifier(request.headers)}`, 40, 60 * 1000);
  return result.allowed
    ? null
    : NextResponse.json(
        { error: "Demasiadas solicitudes. Intentalo de nuevo en unos segundos." },
        { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
      );
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  try {
    const partnerId = partnerIdSchema.parse(request.nextUrl.searchParams.get("partnerId"));
    const result = await listAdminPartnerServices(partnerId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const limited = enforceWriteLimit(request);
  if (limited) return limited;

  try {
    const body: { partnerId?: string; services?: unknown } = await request.json();
    const partnerId = partnerIdSchema.parse(body.partnerId);
    const result = await replacePartnerServices(partnerId, body.services ?? []);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    revalidatePath("/admin");
    revalidatePath("/partners");
    revalidatePath(`/partners/${partnerId}`);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
