"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Navbar({ role, activeView, onViewChange }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    { id: "beds", label: "🛏️ Bed Map" },
    { id: "patients", label: "👥 Patients" },
    { id: "doctors", label: "👨‍⚕️ Physio/Inch" },
    { id: "hospital", label: "🏥 Shift Out" },
    ...(role === "admin"
      ? [
          { id: "admin", label: "🔒 Discharged Archive" },
          { id: "history", label: "📜 Audit Log" }
        ]
      : [])
  ]

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1e293b",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 0 15px rgba(34, 197, 94, 0.4)"
          }}
        >
          🏥
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
            Rehab System
          </h1>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            Patient & Bed Intelligence
          </span>
        </div>
        <span
          style={{
            marginLeft: "8px",
            padding: "3px 8px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: role === "admin" ? "rgba(249, 115, 22, 0.2)" : "rgba(56, 189, 248, 0.2)",
            color: role === "admin" ? "#fb923c" : "#38bdf8",
            border: `1px solid ${role === "admin" ? "rgba(249, 115, 22, 0.4)" : "rgba(56, 189, 248, 0.4)"}`
          }}
        >
          {role || "Staff"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                background: isActive ? "#22c55e" : "#1e293b",
                color: isActive ? "#020617" : "#e2e8f0",
                fontWeight: isActive ? "700" : "500",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: isActive ? "#22c55e" : "#334155",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {item.label}
            </button>
          )
        })}

        <button
          onClick={handleLogout}
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            marginLeft: "6px"
          }}
        >
          🚪 Logout
        </button>
      </div>
    </header>
  )
}
