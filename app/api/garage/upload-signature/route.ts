import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";

export async function POST(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = checkRateLimit("garage-upload:" + session.user.id, 20, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas subidas." }, { status: 429 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !secret) {
    return NextResponse.json({ error: "La subida de fotografias no esta configurada." }, { status: 503 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "tramassso/garage/" + session.user.id;
  const payload = "folder=" + folder + "&timestamp=" + timestamp;
  const signature = crypto.createHash("sha1").update(payload + secret).digest("hex");
  return NextResponse.json({ cloudName, apiKey, folder, timestamp, signature });
}
