export type LaunchSignals = {
  hasPrismaHistory: boolean;
  hasAccountToken: boolean;
  hasRateLimit: boolean;
  hasCarPhoto: boolean;
  hasPostReport: boolean;
  hasTicketColumn: boolean;
  anonReadsUsers: boolean;
  anonDeletesUsers: boolean;
  authenticatedEditsCars: boolean;
  registrationEnabled: boolean;
  verificationEnabled: boolean;
  securityEnabled: boolean;
  ticketingEnabled: boolean;
  socialEnabled: boolean;
  galleryEnabled: boolean;
};

export type LaunchFinding = { id: string; severity: "blocker" | "warning"; detail: string };

export function evaluateLaunch(signals: LaunchSignals): LaunchFinding[] {
  const findings: LaunchFinding[] = [];
  const block = (id: string, detail: string) => findings.push({ id, severity: "blocker", detail });
  const warn = (id: string, detail: string) => findings.push({ id, severity: "warning", detail });

  if (signals.anonReadsUsers || signals.anonDeletesUsers || signals.authenticatedEditsCars)
    block("data-access", "Los roles de Supabase pueden acceder directamente a tablas privadas de Prisma.");
  if (!signals.hasPrismaHistory)
    block("prisma-history", "Falta el historial de migraciones Prisma. Es necesario conciliar el esquema existente.");
  if (!signals.hasAccountToken || !signals.hasRateLimit || !signals.hasCarPhoto || !signals.hasPostReport)
    block("community-schema", "Faltan tablas necesarias para seguridad, galerías o moderación.");
  if (!signals.hasTicketColumn)
    block("tickets-schema", "Falta la migración de entradas y lista de espera.");
  if (!signals.securityEnabled || !signals.verificationEnabled || !signals.registrationEnabled)
    warn("registration-off", "El registro y la verificación todavía no están completamente activados.");
  if (!signals.ticketingEnabled)
    warn("tickets-off", "Las entradas y el check-in QR todavía no están activos.");
  if (!signals.socialEnabled || !signals.galleryEnabled)
    warn("community-off", "El feed social o las galerías todavía están desactivados.");
  return findings;
}
