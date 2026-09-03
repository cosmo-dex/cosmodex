import { ImageResponse } from "next/og";

export const alt = "CosmoDex — Gamified Coding Platform for Students";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050508",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(141, 55, 214, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(56, 189, 248, 0.2) 0%, transparent 50%)",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 24px",
            borderRadius: "9999px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#38bdf8",
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "32px",
            letterSpacing: "1px",
          }}
        >
          🚀 GAMIFIED CODING EXPEDITION
        </div>

        <div
          style={{
            fontSize: "76px",
            fontWeight: 900,
            background: "linear-gradient(to right, #ffffff, #e2e8f0, #cbd5e1)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-2px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          CosmoDex
        </div>

        <div
          style={{
            fontSize: "30px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.4,
            marginBottom: "48px",
          }}
        >
          Learn. Code. Battle. Level Up. Earn.
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: "10px 22px",
              borderRadius: "12px",
              background: "rgba(232, 115, 195, 0.15)",
              border: "1px solid rgba(232, 115, 195, 0.3)",
              color: "#f472b6",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            ⚔️ 1v1 Space Battle Arena
          </div>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: "12px",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            🐍 Python & SQL Quests
          </div>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: "12px",
              background: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              color: "#c084fc",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            🏆 Cosmic League Ranks
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "30px",
            color: "#64748b",
            fontSize: "16px",
            letterSpacing: "1px",
          }}
        >
          www.cosmodex.in
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
