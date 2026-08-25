import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentRecceMindSession } from "@/app/lib/reccemind-auth";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";
import {
  isRecceMindAnalysis,
  normalizeStageThresholds,
  safeDriverId,
  safeSourceName,
  safeSourceType,
  safeStageName,
  stageMetrics,
} from "@/app/lib/reccemind-stage";

interface StageSummaryRow {
  id: string;
  name: string;
  driverId: string;
  sourceType: string | null;
  sourceName: string | null;
  status: string;
  distanceMeters: number | null;
  curveCount: number;
  noteCount: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

function isMissingStageTable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError
    && error.code === "P2010"
    && String(error.meta?.code ?? "") === "42P01";
}

function serializeSummary(stage: StageSummaryRow) {
  return {
    ...stage,
    createdAt: stage.createdAt.toISOString(),
    updatedAt: stage.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await getCurrentRecceMindSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });

  try {
    const rows = await prisma.$queryRaw<StageSummaryRow[]>(Prisma.sql`
      SELECT
        "id", "name", "driverId", "sourceType", "sourceName", "status",
        "distanceMeters", "curveCount", "noteCount", "reviewCount", "createdAt", "updatedAt"
      FROM "RecceMindStage"
      WHERE "ownerId" = ${session.user.id}
      ORDER BY "updatedAt" DESC
      LIMIT 250
    `);
    return NextResponse.json({ stages: rows.map(serializeSummary), storageReady: true });
  } catch (error) {
    if (isMissingStageTable(error)) return NextResponse.json({ stages: [], storageReady: false });
    console.error("Unable to list RecceMind stages", error);
    return NextResponse.json({ error: "No se pudieron cargar los tramos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentRecceMindSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });

  const limit = checkRateLimit(
    `reccemind-stage-save:${session.user.id}:${requestIdentifier(request.headers)}`,
    120,
    60 * 60 * 1000,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados guardados seguidos. Inténtalo de nuevo en unos minutos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "El tramo es demasiado grande para guardarlo." }, { status: 413 });
  }

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
  const id = crypto.randomUUID();
  const driverId = safeDriverId(payload.driverId);
  const sourceType = safeSourceType(payload.sourceType);
  const sourceName = safeSourceName(payload.sourceName);
  const analysisJson = JSON.stringify(analysis);
  const thresholdsJson = JSON.stringify(thresholds);

  if (analysisJson.length > 7 * 1024 * 1024) {
    return NextResponse.json({ error: "El análisis del tramo es demasiado grande." }, { status: 413 });
  }

  try {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "RecceMindStage" (
        "id", "ownerId", "name", "driverId", "sourceType", "sourceName", "status",
        "analysis", "thresholds", "distanceMeters", "curveCount", "noteCount", "reviewCount"
      ) VALUES (
        ${id}, ${session.user.id}, ${name}, ${driverId}, ${sourceType}, ${sourceName}, 'draft',
        CAST(${analysisJson} AS jsonb), CAST(${thresholdsJson} AS jsonb), ${metrics.distanceMeters},
        ${metrics.curveCount}, ${metrics.noteCount}, ${metrics.reviewCount}
      )
    `);

    return NextResponse.json({
      stage: {
        id,
        name,
        driverId,
        sourceType,
        sourceName,
        status: "draft",
        ...metrics,
      },
    }, { status: 201 });
  } catch (error) {
    if (isMissingStageTable(error)) {
      return NextResponse.json({ error: "La biblioteca de tramos todavía no está inicializada." }, { status: 503 });
    }
    console.error("Unable to create RecceMind stage", error);
    return NextResponse.json({ error: "No se pudo guardar el tramo." }, { status: 500 });
  }
}
