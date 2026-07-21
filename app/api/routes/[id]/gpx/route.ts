import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/app/lib/supabase";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("routes").select("gpx_filename,gpx_data").eq("id", id).maybeSingle();
  if (error || !data?.gpx_data) return NextResponse.json({ error: "Esta ruta no tiene un archivo GPX disponible." }, { status: 404 });

  const safeId = id.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80) || "ruta";
  return new NextResponse(String(data.gpx_data), {
    headers: {
      "Content-Type": "application/gpx+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="tramassso-ruta-${safeId}.gpx"`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
