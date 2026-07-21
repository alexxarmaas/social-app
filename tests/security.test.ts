import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../app/lib/json-ld";
import { safeInternalPath } from "../app/lib/safe-redirect";
import { contactRequestInputSchema, eventInputSchema, partnerInputSchema, routeInputSchema } from "../app/lib/tramassso-content";

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
