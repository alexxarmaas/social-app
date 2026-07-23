import nodemailer from "nodemailer";
import type { ContactRequestInput } from "@/app/lib/tramassso-content";
import type { RegistrationInput } from "@/app/lib/event-registrations";

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

function createTransport(config: NonNullable<ReturnType<typeof readEmailConfig>>) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export async function sendContactNotification(input: ContactRequestInput) {
  const config = readEmailConfig();
  if (!config) {
    return { delivered: false, reason: "not-configured" as const };
  }

  const transport = createTransport(config);

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

export async function sendRegistrationNotification(
  input: RegistrationInput,
  event: { title: string; date: string; location: string; participation_mode: "interest" | "managed" },
) {
  const config = readEmailConfig();
  if (!config) return { delivered: false, reason: "not-configured" as const };
  const transport = createTransport(config);
  const modeLabel = event.participation_mode === "managed" ? "inscripcion" : "lista de interesados";
  const attendeeMessage = event.participation_mode === "managed"
    ? "Hemos recibido tu solicitud. Tramassso la revisara y podra contactarte para confirmar la plaza."
    : "Hemos guardado tu interes para enviarte novedades. Esto no equivale a una inscripcion oficial del organizador.";

  const results = await Promise.allSettled([
    transport.sendMail({
      from: `"Tramassso Web" <${config.user}>`,
      to: config.recipient,
      replyTo: input.email,
      subject: `Nueva ${modeLabel} · ${safeHeader(event.title)}`,
      text: [
        `Nueva ${modeLabel} recibida desde tramassso.com`, "",
        `Evento: ${event.title}`,
        `Fecha: ${new Date(event.date).toLocaleString("es-ES")}`,
        `Lugar: ${event.location}`,
        `Nombre: ${input.name}`,
        `Correo: ${input.email}`,
        `Telefono: ${input.phone || "No indicado"}`,
        `Vehiculo: ${input.vehicle}`,
        `Matricula: ${input.license_plate}`,
        `Acompañantes: ${input.companions}`,
        "", "La solicitud esta guardada en el panel de administracion.",
      ].join("\n"),
    }),
    transport.sendMail({
      from: `"Tramassso" <${config.user}>`,
      to: input.email,
      subject: `Hemos recibido tu solicitud · ${safeHeader(event.title)}`,
      text: [
        `Hola ${input.name},`, "", attendeeMessage, "",
        `Evento: ${event.title}`,
        `Fecha: ${new Date(event.date).toLocaleString("es-ES")}`,
        `Lugar: ${event.location}`,
        `Vehiculo: ${input.vehicle}`,
        `Matricula: ${input.license_plate}`,
        "", "Puedes responder a este correo si necesitas corregir tus datos.", "", "Tramassso",
      ].join("\n"),
    }),
  ]);

  const delivered = results.some((result) => result.status === "fulfilled");
  if (!delivered) console.error("No se pudieron enviar los correos de inscripcion por SMTP.");
  return delivered ? { delivered: true as const } : { delivered: false, reason: "send-failed" as const };
}

export async function sendRegistrationStatusNotification(input: {
  name: string;
  email: string;
  status: "new" | "confirmed" | "cancelled";
  event_title: string;
  event_date: string;
  event_location: string;
}) {
  if (input.status === "new") return { delivered: false, reason: "not-needed" as const };
  const config = readEmailConfig();
  if (!config) return { delivered: false, reason: "not-configured" as const };
  const confirmed = input.status === "confirmed";

  try {
    await createTransport(config).sendMail({
      from: `"Tramassso" <${config.user}>`,
      to: input.email,
      subject: `${confirmed ? "Plaza confirmada" : "Solicitud cancelada"} · ${safeHeader(input.event_title)}`,
      text: [
        `Hola ${input.name},`, "",
        confirmed ? "Tu plaza ha sido confirmada por Tramassso." : "Tu solicitud ha sido marcada como cancelada.", "",
        `Evento: ${input.event_title}`,
        `Fecha: ${new Date(input.event_date).toLocaleString("es-ES")}`,
        `Lugar: ${input.event_location}`,
        "", "Si necesitas ayuda, responde a este correo.", "", "Tramassso",
      ].join("\n"),
    });
    return { delivered: true as const };
  } catch (error) {
    console.error("No se pudo enviar el cambio de estado por SMTP.", error instanceof Error ? error.message : "Error desconocido");
    return { delivered: false, reason: "send-failed" as const };
  }
}
