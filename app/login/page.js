"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.")
      return
    }

    setLoading(true)
    setErrorMsg("")

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setErrorMsg(error.message || "Invalid login credentials")
        setLoading(false)
        return
      }

      const userId = data?.user?.id
      if (!userId) {
        setErrorMsg("User session not found.")
        setLoading(false)
        return
      }

      // 2. Fetch role directly from Supabase 'profiles' table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

      // If profile doesn't exist yet, create one from user metadata or default to user
      if (profileError && profileError.code === "PGRST116") {
        const defaultRole = data.user.user_metadata?.role || "receptionist"
        await supabase
          .from("profiles")
          .insert([{ id: userId, email: email.trim(), role: defaultRole }])
      }

      // 3. Navigate to dashboard (Dashboard dynamically adapts to profile role)
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
          maxWidth: "420px",
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8)",
          color: "#f8fafc",
          boxSizing: "border-box"
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
            Sign in with your hospital credentials
          </p>
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
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
              autoFocus
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  fontWeight: "600"
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38bdf8",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
              background: "#22c55e",
              border: "none",
              borderRadius: "8px",
              color: "#020617",
              fontWeight: "700",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "6px",
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.35)"
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            padding: "12px 14px",
            background: "#080e1e",
            border: "1px solid #1e293b",
            borderRadius: "10px",
            fontSize: "11px",
            color: "#64748b",
            lineHeight: "1.6"
          }}
        >
          <div style={{ fontWeight: "700", color: "#94a3b8", marginBottom: "2px" }}>Roles Managed in Supabase:</div>
          <div>👑 <b>admin</b> • 🛡️ <b>administrator</b> • 💼 <b>receptionist</b> • 🩺 <b>doctor</b></div>
        </div>
      </div>
    </div>
  )
}