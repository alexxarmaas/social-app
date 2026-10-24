import nodemailer from "nodemailer";
import { communityOrigin } from "@/app/lib/community-security";

export async function sendAccountEmail(input: { to: string; name: string; token: string; kind: "verify" | "reset" }) {
  const origin = communityOrigin();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;
  if (!origin || !user || !pass) return false;
  const port = Number(process.env.SMTP_PORT || "465");
  const host = process.env.SMTP_HOST?.trim() || "authsmtp.securemail.pro";
  const transport = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  const url = new URL(input.kind === "verify" ? "/verify-email" : "/reset-password", origin);
  url.searchParams.set("token", input.token);
  const verify = input.kind === "verify";
  try {
    await transport.sendMail({
      from: '"Tramassso" <' + user + '>',
      to: input.to,
      subject: verify ? "Verifica tu cuenta de Tramassso" : "Restablece tu contraseña de Tramassso",
      text: [
        "Hola " + input.name + ",", "",
        verify ? "Confirma tu correo para activar tu cuenta." : "Recibimos una solicitud para restablecer tu contraseña.",
        "Abre este enlace para confirmar la operacion:", url.toString(), "",
        verify ? "El enlace caduca en 60 minutos." : "El enlace caduca en 30 minutos.",
        "Si no lo solicitaste puedes ignorar este mensaje.", "", "Equipo Tramassso",
      ].join("\n"),
    });
    return true;
  } catch (error) {
    console.error("Unable to deliver account email", error instanceof Error ? error.message : "send error");
    return false;
  }
}
