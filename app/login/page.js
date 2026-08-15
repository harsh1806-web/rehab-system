"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  const [selectedRole, setSelectedRole] = useState("admin") // "admin" | "administrator" | "receptionist" | "doctor"
  const [email, setEmail] = useState("admin@test.com")
  const [password, setPassword] = useState("123456")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const rolePortals = [
    {
      id: "admin",
      title: "Admin",
      icon: "👑",
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.12)",
      borderColor: "rgba(34, 197, 94, 0.35)",
      defaultEmail: "admin@test.com",
      description: "Full control, bed allocation, editing, and staff management."
    },
    {
      id: "administrator",
      title: "Administrator",
      icon: "🛡️",
      color: "#60a5fa",
      bg: "rgba(96, 165, 250, 0.12)",
      borderColor: "rgba(96, 165, 250, 0.35)",
      defaultEmail: "administrator@test.com",
      description: "Full system visibility with strict read-only audit access."
    },
    {
      id: "receptionist",
      title: "Receptionist",
      icon: "💼",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      borderColor: "rgba(245, 158, 11, 0.35)",
      defaultEmail: "user@test.com",
      description: "Daily admissions, bed assignment, and operational patient care."
    },
    {
      id: "doctor",
      title: "Doctor",
      icon: "🩺",
      color: "#38bdf8",
      bg: "rgba(56, 189, 248, 0.12)",
      borderColor: "rgba(56, 189, 248, 0.35)",
      defaultEmail: "doctor@test.com",
      description: "Clinical status review and direct medical diagnosis editing."
    }
  ]

  const activePortal = rolePortals.find((p) => p.id === selectedRole) || rolePortals[0]

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
    const portal = rolePortals.find((p) => p.id === roleId)
    if (portal) {
      setEmail(portal.defaultEmail)
    }
    setErrorMsg("")
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.")
      return
    }

    setLoading(true)
    setErrorMsg("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      const userId = data?.user?.id
      if (!userId) {
        setErrorMsg("User session not found.")
        setLoading(false)
        return
      }

      // Synchronize role with selected portal
      await supabase
        .from("profiles")
        .upsert([
          {
            id: userId,
            email: email.trim(),
            role: selectedRole
          }
        ])

      router.push("/admin")
    } catch (err) {
      console.error(err)
      setErrorMsg("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid #334155",
          padding: "36px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8)",
          color: "#f8fafc",
          boxSizing: "border-box"
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 12px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              boxShadow: "0 0 25px rgba(34, 197, 94, 0.35)"
            }}
          >
            🏥
          </div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Rehab Hospital Portal
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Select your role to sign in to your dedicated workspace
          </p>
        </div>

        {/* 4-Role Portal Selector Grid */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "8px", fontWeight: "700" }}>
            SELECT ACCESS ROLE:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {rolePortals.map((p) => {
              const isSelected = selectedRole === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleRoleSelect(p.id)}
                  style={{
                    background: isSelected ? p.bg : "#080e1e",
                    border: `1px solid ${isSelected ? p.color : "#1e293b"}`,
                    borderRadius: "10px",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left"
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: isSelected ? p.color : "#cbd5e1" }}>
                      {p.title}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Portal Info Banner */}
        <div
          style={{
            background: activePortal.bg,
            border: `1px solid ${activePortal.borderColor}`,
            padding: "10px 14px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px"
          }}
        >
          <span style={{ fontSize: "18px" }}>{activePortal.icon}</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: activePortal.color }}>
              {activePortal.title} Workspace
            </div>
            <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px" }}>
              {activePortal.description}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "18px"
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "6px",
                fontWeight: "600"
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#080e1e",
                border: "1px solid #334155",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "6px",
                fontWeight: "600"
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#080e1e",
                border: "1px solid #334155",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: activePortal.color,
              border: "none",
              borderRadius: "8px",
              color: "#020617",
              fontWeight: "700",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "6px",
              transition: "all 0.15s ease",
              boxShadow: `0 0 15px ${activePortal.color}44`
            }}
          >
            {loading ? "Authenticating..." : `Sign In as ${activePortal.title}`}
          </button>
        </form>
      </div>
    </div>
  )
}