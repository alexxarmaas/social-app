import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../app/lib/json-ld";
import { safeInternalPath } from "../app/lib/safe-redirect";
import { contactRequestInputSchema, eventInputSchema, partnerInputSchema, routeInputSchema } from "../app/lib/tramassso-content";
import { normalizeLicensePlate, registrationInputSchema } from "../app/lib/event-registrations";
import { createEventIcs, googleCalendarUrl } from "../app/lib/event-calendar";

test("JSON-LD escapes HTML-significant characters", () => {
  const output = serializeJsonLd({ name: "</script><script>alert(1)</script>&" });
  assert.equal(output.includes("</script>"), false);
  assert.match(output, /\\u003c/);
});

test("redirects are limited to internal paths", () => {
  assert.equal(safeInternalPath("/admin?tab=events"), "/admin?tab=events");
  assert.equal(safeInternalPath("//evil.example"), "/admin");
  assert.equal(safeInternalPath("https://evil.example"), "/admin");
});

test("content validation requires HTTPS and valid dates", () => {
  assert.equal(partnerInputSchema.safeParse({ name: "Marca", category: "Taller", logo_url: "http://example.com/a.png", website_url: "", description: "", is_featured: false }).success, false);
  assert.equal(eventInputSchema.safeParse({ title: "Evento valido", description: "Descripcion suficientemente larga", date: "not-a-date", location: "Gran Canaria", cover_image_url: "", gallery_urls: [] }).success, false);
});

test("route filters only accept supported classifications", () => {
  const route = {
    title: "Ruta de costa",
    description: "Una ruta suficientemente detallada para poder publicarse.",
    start_point: "Las Palmas",
    end_point: "Agaete",
    distance_km: 38,
    drive_time_minutes: 55,
    cover_image_url: "",
    gallery_urls: [],
    coordinates: "",
    difficulty: "imposible",
    route_type: "costa",
    recommended_time: "Al amanecer",
  };
  assert.equal(routeInputSchema.safeParse(route).success, false);
  assert.equal(routeInputSchema.safeParse({ ...route, difficulty: "media" }).success, true);
});

test("contact requests reject invalid emails and accept the anti-spam field", () => {
  const request = { name: "Alex", email: "correo-invalido", brand: "Marca", brief: "Propuesta con suficiente detalle.", website: "" };
  assert.equal(contactRequestInputSchema.safeParse(request).success, false);
  assert.equal(contactRequestInputSchema.safeParse({ ...request, email: "alex@example.com", website: "bot.example" }).success, true);
});

test("event participation validates external URLs and capacity", () => {
  const event = { title: "Evento valido", description: "Descripcion suficientemente larga", date: "2027-07-21T10:00:00Z", location: "Gran Canaria", cover_image_url: "", gallery_urls: [], participation_mode: "external", organizer_name: "Organizador", external_registration_url: "", max_participants: null };
  assert.equal(eventInputSchema.safeParse(event).success, false);
  assert.equal(eventInputSchema.safeParse({ ...event, external_registration_url: "https://example.com/registro" }).success, true);
  assert.equal(eventInputSchema.safeParse({ ...event, participation_mode: "managed", external_registration_url: "", max_participants: 0 }).success, false);
});

test("registrations require vehicle, license plate, consent and valid companions", () => {
  const request = {
    name: "Alex",
    email: "alex@example.com",
    phone: "",
    vehicle: "Volkswagen Polo",
    license_plate: "1234 abc",
    companions: 2,
    privacy: true,
    website: "",
  };

  const parsed = registrationInputSchema.safeParse(request);
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.license_plate, "1234 ABC");

  assert.equal(registrationInputSchema.safeParse({ ...request, vehicle: "" }).success, false);
  assert.equal(registrationInputSchema.safeParse({ ...request, license_plate: "" }).success, false);
  assert.equal(registrationInputSchema.safeParse({ ...request, privacy: false }).success, false);
  assert.equal(registrationInputSchema.safeParse({ ...request, companions: 21 }).success, false);
  assert.equal(normalizeLicensePlate("gc-1234-ab"), "GC1234AB");
});

test("calendar exports escape event content and create Google links", () => {
  const event = { id: "event-1", title: "Ruta, motor", description: "Linea 1\nLinea 2", date: "2027-07-21T10:00:00Z", location: "Las Palmas; GC", url: "https://tramassso.com/events/event-1" };
  const ics = createEventIcs(event);
  assert.match(ics, /SUMMARY:Ruta\\, motor/);
  assert.match(ics, /LOCATION:Las Palmas\\; GC/);
  assert.match(googleCalendarUrl(event), /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
});
