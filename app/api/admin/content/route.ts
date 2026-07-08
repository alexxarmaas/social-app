import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  if (value === "events" || value === "routes") {
    return value;
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const kind = parseKind(request.nextUrl.searchParams.get("kind"));

  if (!kind) {
    return NextResponse.json({ error: "Missing kind" }, { status: 400 });
  }

  const result = await listAdminContent(kind);

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: { kind?: string; payload?: unknown } = await request.json();
  const kind = parseKind(body.kind ?? null);

  if (!kind || !body.payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await saveContent(kind, body.payload);

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/routes");

  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: { kind?: string; id?: string; payload?: unknown } = await request.json();
  const kind = parseKind(body.kind ?? null);

  if (!kind || !body.id || !body.payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await saveContent(kind, body.payload, body.id);

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/routes");

  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: { kind?: string; id?: string } = await request.json();
  const kind = parseKind(body.kind ?? null);

  if (!kind || !body.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await deleteContent(kind, body.id);

  if ("error" in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/routes");

  return NextResponse.json(result);
}