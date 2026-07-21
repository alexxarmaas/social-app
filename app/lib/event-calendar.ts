export interface CalendarEventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  url: string;
}

function compactUtcDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function calendarDates(date: string) {
  const start = new Date(date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start: compactUtcDate(start), end: compactUtcDate(end) };
}

export function createEventIcs(event: CalendarEventData) {
  const { start, end } = calendarDates(event.date);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tramassso//Eventos//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(event.id)}@tramassso.com`,
    `DTSTAMP:${compactUtcDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(`${event.description}\n\n${event.url}`)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    `URL:${escapeIcs(event.url)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function googleCalendarUrl(event: CalendarEventData) {
  const { start, end } = calendarDates(event.date);
  const search = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: `${event.description}\n\n${event.url}`,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${search.toString()}`;
}
