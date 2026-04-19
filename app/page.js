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
      background: "#0f172a"
    }}>
      <div style={{
        background: "#1e293b",
        padding: "40px",
        borderRadius: "12px",
        textAlign: "center",
        width: "300px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}>
        <h1 style={{ color: "white", marginBottom: "10px" }}>
          Rehab System
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
          Patient & Bed Management
        </p>

        <button
          onClick={() => router.push("/login")}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            background: "#22c55e",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer"
          }}
        >
          Login
        </button>

        <button
          onClick={() => router.push("/register")}
          style={{
            width: "100%",
            padding: "10px",
            background: "#334155",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer"
          }}
        >
          Register
        </button>
      </div>
    </div>
  )
}