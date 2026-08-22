import type { RecceMindAnalysis } from "@/app/lib/reccemind";

export interface RecceMindPrintRow {
  positionMeters: number;
  note: string;
  nextDistance: string | null;
}

export interface RecceMindPrintOptions {
  driverId: string;
  stageName?: string;
  generatedAt?: Date;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function rallyDistance(raw: string) {
  const meters = Number.parseFloat(raw);
  if (!Number.isFinite(meters)) return raw;
  const step = meters < 100 ? 10 : meters <= 300 ? 25 : 50;
  return String(Math.max(step, Math.round(meters / step) * step));
}

export function buildRecceMindPrintRows(result: RecceMindAnalysis): RecceMindPrintRow[] {
  const rows: RecceMindPrintRow[] = [];

  for (let index = 0; index < result.pacenotes.length; index += 1) {
    const note = result.pacenotes[index];
    if (note.type === "distance") continue;

    const next = result.pacenotes[index + 1];
    rows.push({
      positionMeters: note.distance,
      note: note.text,
      nextDistance: next?.type === "distance" ? rallyDistance(next.text) : null,
    });
  }

  return rows;
}

function estimatedDistanceMeters(result: RecceMindAnalysis) {
  if (result.distanceMeters && result.distanceMeters > 0) return result.distanceMeters;
  return Math.max(result.curves.at(-1)?.end_distance ?? 0, result.pacenotes.at(-1)?.distance ?? 0);
}

export function buildRecceMindPrintDocument(result: RecceMindAnalysis, options: RecceMindPrintOptions) {
  const rows = buildRecceMindPrintRows(result);
  const stageName = options.stageName?.trim() || result.sourceName?.trim() || "Tramo RecceMind";
  const generatedAt = options.generatedAt ?? new Date();
  const totalDistance = estimatedDistanceMeters(result);
  const dateLabel = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);

  const bodyRows = rows.map((row, index) => `
    <tr class="note-row">
      <td class="number">${index + 1}</td>
      <td class="position">${(row.positionMeters / 1000).toFixed(3)}</td>
      <td class="instruction">${escapeHtml(row.note)}</td>
      <td class="link-distance">${row.nextDistance ? escapeHtml(row.nextDistance) : "—"}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(stageName)} · RecceMind</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    html { background: #fff; }
    body { margin: 0; color: #111; background: #fff; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { width: 100%; }
    header { display: grid; grid-template-columns: 1.45fr .8fr; gap: 8mm; align-items: end; padding-bottom: 5mm; border-bottom: 3px solid #111; }
    .brand { font-size: 10px; font-weight: 800; letter-spacing: .28em; text-transform: uppercase; }
    h1 { margin: 3mm 0 0; font-size: 24px; line-height: 1.05; text-transform: uppercase; }
    .subtitle { margin-top: 2mm; color: #555; font-size: 11px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #111; }
    .meta div { min-height: 14mm; padding: 2.5mm; border-right: 1px solid #111; border-bottom: 1px solid #111; }
    .meta div:nth-child(2n) { border-right: 0; }
    .meta div:nth-last-child(-n+2) { border-bottom: 0; }
    .meta span { display: block; color: #666; font-size: 8px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .meta strong { display: block; margin-top: 1.5mm; font-size: 12px; }
    .marker { margin: 5mm 0 3mm; padding: 2.5mm 4mm; border: 2px solid #111; font-size: 13px; font-weight: 900; letter-spacing: .25em; text-align: center; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    thead { display: table-header-group; }
    th { padding: 2.5mm 2mm; border-top: 1px solid #111; border-bottom: 2px solid #111; font-size: 8px; letter-spacing: .14em; text-transform: uppercase; }
    th:nth-child(1) { width: 8%; }
    th:nth-child(2) { width: 15%; }
    th:nth-child(3) { width: 57%; text-align: left; }
    th:nth-child(4) { width: 20%; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    td { border-bottom: 1px solid #bbb; vertical-align: middle; }
    .number { padding: 4mm 2mm; color: #777; font-size: 10px; text-align: center; }
    .position { padding: 4mm 2mm; font-family: "Courier New", monospace; font-size: 12px; font-weight: 700; text-align: center; }
    .instruction { padding: 4mm 3mm; font-size: 18px; font-weight: 900; line-height: 1.15; text-transform: uppercase; }
    .link-distance { padding: 3mm 2mm; border-left: 2px solid #111; font-size: 22px; font-weight: 900; text-align: center; }
    .finish { margin-top: 4mm; }
    footer { display: flex; justify-content: space-between; gap: 8mm; margin-top: 5mm; padding-top: 3mm; border-top: 1px solid #999; color: #666; font-size: 8px; line-height: 1.4; }
    @media screen {
      body { padding: 10mm; background: #e5e5e5; }
      .sheet { max-width: 210mm; min-height: 297mm; margin: 0 auto; padding: 10mm; background: white; box-shadow: 0 10px 40px rgba(0,0,0,.18); }
    }
    @media print {
      .sheet { padding: 0; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <header>
      <div>
        <div class="brand">RecceMind · Hoja de notas</div>
        <h1>${escapeHtml(stageName)}</h1>
        <div class="subtitle">Borrador generado y editado en RecceMind</div>
      </div>
      <div class="meta">
        <div><span>Perfil / piloto</span><strong>${escapeHtml(options.driverId || "—")}</strong></div>
        <div><span>Fecha</span><strong>${escapeHtml(dateLabel)}</strong></div>
        <div><span>Distancia</span><strong>${totalDistance > 0 ? `${(totalDistance / 1000).toFixed(2)} km` : "—"}</strong></div>
        <div><span>Notas</span><strong>${rows.length}</strong></div>
      </div>
    </header>

    <div class="marker">Salida</div>
    <table>
      <thead>
        <tr><th>#</th><th>Km</th><th>Nota</th><th>Enlace</th></tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <div class="marker finish">Meta</div>

    <footer>
      <span>Las distancias de enlace se muestran redondeadas con criterio de copiloto; la posición acumulada conserva la referencia métrica del análisis.</span>
      <span>Documento de trabajo. Revisar las notas antes de cualquier uso en carretera o competición.</span>
    </footer>
  </main>
</body>
</html>`;
}
