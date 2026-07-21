import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";
import type { NextRequest } from "next/server";

const CLOUDINARY_FOLDER = "tramassso";

function readCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Faltan variables de Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.");
  }

  return { cloudName, apiKey, apiSecret };
}

function signUploadParameters(parameters: Record<string, string | number>, apiSecret: string) {
  const payload = Object.keys(parameters)
    .sort()
    .map((key) => `${key}=${parameters[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  const session = await getCurrentAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(`cloudinary:${requestIdentifier(request.headers)}`, 20, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  try {
    const { cloudName, apiKey, apiSecret } = readCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const parameters = {
      folder: CLOUDINARY_FOLDER,
      timestamp,
    };

    return NextResponse.json({
      cloudName,
      apiKey,
      folder: CLOUDINARY_FOLDER,
      timestamp,
      signature: signUploadParameters(parameters, apiSecret),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo preparar la subida a Cloudinary." },
      { status: 500 },
    );
  }
}
