import nodemailer from "nodemailer";
import type { ContactRequestInput } from "@/app/lib/tramassso-content";

function readEmailConfig() {
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || user;

  if (!user || !password || !recipient) {
    return null;
  }

  const configuredPort = Number(process.env.SMTP_PORT ?? "465");
  return {
    host: process.env.SMTP_HOST?.trim() || "authsmtp.securemail.pro",
    port: Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 465,
    user,
    password,
    recipient,
  };
}

function safeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactNotification(input: ContactRequestInput) {
  const config = readEmailConfig();
  if (!config) {
    return { delivered: false, reason: "not-configured" as const };
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  try {
    await transport.sendMail({
      from: `"Tramassso Web" <${config.user}>`,
      to: config.recipient,
      replyTo: input.email,
      subject: `Nueva solicitud web · ${safeHeader(input.brand)}`,
      text: [
        "Nueva solicitud recibida desde tramassso.com",
        "",
        `Nombre: ${input.name}`,
        `Marca: ${input.brand}`,
        `Correo: ${input.email}`,
        "",
        "Propuesta:",
        input.brief,
        "",
        "La solicitud también está guardada en el panel de administración.",
      ].join("\n"),
    });
    return { delivered: true as const };
  } catch (error) {
    console.error("No se pudo enviar la notificacion de contacto por SMTP.", error instanceof Error ? error.message : "Error desconocido");
    return { delivered: false, reason: "send-failed" as const };
  }
}
