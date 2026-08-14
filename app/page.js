"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
        padding: "20px"
      }}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid #334155",
          padding: "48px 40px",
          borderRadius: "24px",
          textAlign: "center",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
          color: "#f8fafc"
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 16px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            boxShadow: "0 0 25px rgba(34, 197, 94, 0.4)"
          }}
        >
          🏥
        </div>

        <h1 style={{ margin: "0 0 8px 0", fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Rehab System
        </h1>

        <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 28px 0", lineHeight: "1.5" }}>
          Clinical Patient & Real-Time Bed Allocation Intelligence
        </p>

        <div
          style={{
            background: "#080e1e",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "28px",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "13px",
            color: "#cbd5e1"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>🛏️</span>
            <span>Interactive multi-block bed topology</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>⏱️</span>
            <span>Accurate clinical stay & billing days</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>👨‍⚕️</span>
            <span>Physiotherapist caseload balancing</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/login")}
          style={{
            width: "100%",
            padding: "14px",
            background: "#22c55e",
            border: "none",
            borderRadius: "10px",
            color: "#020617",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(34, 197, 94, 0.35)",
            transition: "all 0.2s ease"
          }}
        >
          Access Portal →
        </button>

        <p
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#64748b",
            margin: "20px 0 0 0"
          }}
        >
          Authorized hospital personnel only
        </p>
      </div>
    </div>
  )
}