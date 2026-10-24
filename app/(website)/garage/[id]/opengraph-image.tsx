import { ImageResponse } from "next/og";
import { publicCar } from "@/app/lib/community-data";

export const runtime = "nodejs";
export const alt = "Tarjeta de coche Tramassso Garage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GarageSocialCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await publicCar(id);
  if (!car) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#080808", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 900 }}>Tramassso Garage</div>,
      size,
    );
  }

  const title = (car.make + " " + car.model).slice(0, 75);
  const year = String(car.year);
  const name = ("@" + car.owner.username).slice(0, 35);
  return new ImageResponse(
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      width: "100%", height: "100%", padding: "58px 72px",
      color: "#ffffff",
      backgroundImage: "linear-gradient(135deg, #29120c 0%, #080808 45%, #160807 100%)",
      border: "12px solid #171717",
      fontFamily: "sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 45, fontWeight: 900, letterSpacing: -2 }}>TRAMASSSO<span style={{ color: "#ff6a00" }}>.</span></div>
        <div style={{ display: "flex", color: "#ff8c35", fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>GARAGE / {year}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", width: 145, height: 9, borderRadius: 9, background: "#ff6a00" }} />
        <div style={{ display: "flex", fontSize: title.length > 30 ? 68 : 88, lineHeight: 1.03, fontWeight: 900, textTransform: "uppercase", letterSpacing: -3, maxWidth: 1050 }}>{title}</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", color: "#d0d0d0", fontSize: 28 }}>
          <span style={{ color: "#ff8c35", fontWeight: 800 }}>{name}</span>
          <span>·</span><span>{year}</span>
          {car.horsepower ? <><span>·</span><span>{car.horsepower} CV</span></> : null}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #343434", paddingTop: 23, fontSize: 22, letterSpacing: 2, color: "#a1a1aa" }}>
        <span>TU COCHE. TU HISTORIA. TU COMUNIDAD.</span>
        <span style={{ color: "#ff6a00" }}>tramassso.com</span>
      </div>
    </div>,
    size,
  );
}
