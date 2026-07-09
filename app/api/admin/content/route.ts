import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { deleteContent, listAdminContent, saveContent } from "@/app/lib/tramassso-content";
import type { ContentKind } from "@/app/lib/tramassso-content";

async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    return null;
  }

  return session;
}

function parseKind(value: string | null): ContentKind | null {
  if (value === "events" || value === "routes" || value === "partners") {
    return value;
  }

  return null;
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

function revalidateContent(kind?: ContentKind, id?: string) {
  revalidatePath("/admin");
  revalidatePath("/");

  if (!kind || kind === "events") {
    revalidatePath("/events");
    if (id) {
      revalidatePath(`/events/${id}`);
    }
  }

  if (!kind || kind === "routes") {
    revalidatePath("/routes");
    if (id) {
      revalidatePath(`/routes/${id}`);
    }
  }

  if (!kind || kind === "partners") {
    revalidatePath("/partners");
  }
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const kind = parseKind(request.nextUrl.searchParams.get("kind"));

  if (!kind) {
    return NextResponse.json({ error: "Falta el tipo de contenido." }, { status: 400 });
  }

  const result = await listAdminContent(kind);

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  try {
    const body: { kind?: string; payload?: unknown } = await request.json();
    const kind = parseKind(body.kind ?? null);

    if (!kind || !body.payload) {
      return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
    }

    const result = await saveContent(kind, body.payload);

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    revalidateContent(kind, "item" in result ? result.item.id : undefined);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  try {
    const body: { kind?: string; id?: string; payload?: unknown } = await request.json();
    const kind = parseKind(body.kind ?? null);

    if (!kind || !body.id || !body.payload) {
      return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
    }

    const result = await saveContent(kind, body.payload, body.id);

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    revalidateContent(kind, body.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const body: { kind?: string; id?: string } = await request.json();
  const kind = parseKind(body.kind ?? null);

  if (!kind || !body.id) {
    return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  }

  const result = await deleteContent(kind, body.id);

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidateContent(kind, body.id);
  return NextResponse.json(result);
}
