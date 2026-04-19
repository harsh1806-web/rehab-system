"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #020617, #0f172a)"
    }}>
      <div style={{
        background: "#1e293b",
        padding: "50px",
        borderRadius: "16px",
        textAlign: "center",
        width: "340px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
      }}>
        <h1 style={{ color: "white", marginBottom: "10px", fontSize: "24px" }}>
          Rehab System
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
          Patient & Bed Management
        </p>

        <button
          onClick={() => router.push("/login")}
          style={{
            width: "100%",
            padding: "12px",
            background: "#22c55e",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            transition: "0.2s"
          }}
        >
          Login
        </button>

        <p style={{
          marginTop: "20px",
          fontSize: "12px",
          color: "#64748b"
        }}>
          Access is restricted. Contact admin for account.
        </p>
      </div>
    </div>
  )
}