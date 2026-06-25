import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

// Edge runtime inlines the font (avoids a Windows fileURLToPath bug in @vercel/og).
export const runtime = "edge";
export const alt = `${SITE.name} — Premium Dota 2 Services`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated social-share card. Luxury black × gold, no external assets.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 120% at 50% -10%, #1a1505 0%, #050505 55%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #F4E9BE, #D4AF37 45%, #937321)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0a0a0a",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            RankUp<span style={{ color: "#D4AF37" }}>PH</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Reach Your Desired Rank{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #F4E9BE, #D4AF37 45%, #937321)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Faster.
          </span>
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "#a3a3a3", maxWidth: 820 }}>
          Professional Dota 2 MMR boosting, duo queue & coaching — trusted by
          competitive players.
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 28,
            fontSize: 24,
            color: "#D4AF37",
            fontWeight: 600,
          }}
        >
          <span>Secure</span>
          <span style={{ color: "#3a3a3a" }}>•</span>
          <span>Verified Boosters</span>
          <span style={{ color: "#3a3a3a" }}>•</span>
          <span>Fast Delivery</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
