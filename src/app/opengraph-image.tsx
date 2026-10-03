import { ImageResponse } from "next/og";
import { BRAND, BRAND_TAGLINE } from "@/lib/config";

/** Default share preview (WhatsApp, Facebook, X) for pages without their own image. Car pages use the car's cover photo. */
export const alt = `${BRAND}: recond cars you can trust`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0e1116", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 10, background: "#c9a55c", color: "#0e1116", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 800 }}>R</div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>{BRAND}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            Recond cars you can <span style={{ color: "#c9a55c", marginLeft: 20 }}>trust.</span>
          </div>
          <div style={{ fontSize: 32, color: "#c5cad3" }}>Auction sheet verified · Showrooms nationwide · WhatsApp your local agent</div>
        </div>
        <div style={{ fontSize: 26, color: "#c9a55c", letterSpacing: 4, textTransform: "uppercase" }}>{BRAND_TAGLINE}</div>
      </div>
    ),
    size,
  );
}
