import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentRecceMindSession } from "@/app/lib/reccemind-auth";
import {
  isRecceMindAnalysis,
  normalizeStageThresholds,
  safeDriverId,
  safeSourceName,
  safeSourceType,
  safeStageName,
  stageMetrics,
} from "@/app/lib/reccemind-stage";

interface StageRow {
  id: string;
  name: string;
  driverId: string;
  sourceType: string | null;
  sourceName: string | null;
  status: string;
  analysis: unknown;
  thresholds: unknown;
  distanceMeters: number | null;
  curveCount: number;
  noteCount: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

type RouteContext = { params: Promise<{ id: string }> };

function isMissingStageTable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError
    && error.code === "P2010"
    && String(error.meta?.code ?? "") === "42P01";
}

function serializeStage(row: StageRow) {
  return {
    ...row,
    thresholds: normalizeStageThresholds(row.thresholds),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function stageId(context: RouteContext) {
  const { id } = await context.params;
  return id.slice(0, 80);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await getCurrentRecceMindSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  const id = await stageId(context);

  try {
    const rows = await prisma.$queryRaw<StageRow[]>(Prisma.sql`
      SELECT
        "id", "name", "driverId", "sourceType", "sourceName", "status", "analysis", "thresholds",
        "distanceMeters", "curveCount", "noteCount", "reviewCount", "createdAt", "updatedAt"
      FROM "RecceMindStage"
      WHERE "id" = ${id} AND "ownerId" = ${session.user.id}
      LIMIT 1
    `);
    if (!rows[0]) return NextResponse.json({ error: "Tramo no encontrado." }, { status: 404 });
    return NextResponse.json({ stage: serializeStage(rows[0]) });
  } catch (error) {
    if (isMissingStageTable(error)) return NextResponse.json({ error: "La biblioteca de tramos todavía no está inicializada." }, { status: 503 });
    console.error("Unable to load RecceMind stage", error);
    return NextResponse.json({ error: "No se pudo cargar el tramo." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getCurrentRecceMindSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  const id = await stageId(context);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const name = safeStageName(payload.name);
  const analysis = payload.analysis;
  if (!name) return NextResponse.json({ error: "El tramo necesita un nombre." }, { status: 400 });
  if (!isRecceMindAnalysis(analysis)) return NextResponse.json({ error: "El análisis del tramo no es válido." }, { status: 400 });

  const thresholds = normalizeStageThresholds(payload.thresholds);
  const metrics = stageMetrics(analysis, thresholds);
  const driverId = safeDriverId(payload.driverId);
  const sourceType = safeSourceType(payload.sourceType);
  const sourceName = safeSourceName(payload.sourceName);
  const analysisJson = JSON.stringify(analysis);
  const thresholdsJson = JSON.stringify(thresholds);
  if (analysisJson.length > 7 * 1024 * 1024) return NextResponse.json({ error: "El análisis del tramo es demasiado grande." }, { status: 413 });

  try {
    const updated = await prisma.$executeRaw(Prisma.sql`
      UPDATE "RecceMindStage"
      SET
        "name" = ${name},
        "driverId" = ${driverId},
        "sourceType" = ${sourceType},
        "sourceName" = ${sourceName},
        "analysis" = CAST(${analysisJson} AS jsonb),
        "thresholds" = CAST(${thresholdsJson} AS jsonb),
        "distanceMeters" = ${metrics.distanceMeters},
        "curveCount" = ${metrics.curveCount},
        "noteCount" = ${metrics.noteCount},
        "reviewCount" = ${metrics.reviewCount},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${id} AND "ownerId" = ${session.user.id}
    `);
    if (!updated) return NextResponse.json({ error: "Tramo no encontrado." }, { status: 404 });
    return NextResponse.json({ stage: { id, name, driverId, sourceType, sourceName, ...metrics } });
  } catch (error) {
    if (isMissingStageTable(error)) return NextResponse.json({ error: "La biblioteca de tramos todavía no está inicializada." }, { status: 503 });
    console.error("Unable to update RecceMind stage", error);
    return NextResponse.json({ error: "No se pudo actualizar el tramo." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await getCurrentRecceMindSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  const id = await stageId(context);

  try {
    const deleted = await prisma.$executeRaw(Prisma.sql`
      DELETE FROM "RecceMindStage"
      WHERE "id" = ${id} AND "ownerId" = ${session.user.id}
    `);
    if (!deleted) return NextResponse.json({ error: "Tramo no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMissingStageTable(error)) return NextResponse.json({ error: "La biblioteca de tramos todavía no está inicializada." }, { status: 503 });
    console.error("Unable to delete RecceMind stage", error);
    return NextResponse.json({ error: "No se pudo eliminar el tramo." }, { status: 500 });
  }
}
