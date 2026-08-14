"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.warn("Could not fetch user profile role:", profileError)
      }

      const role = profile?.role || "user"
      if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/user")
      }
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
        padding: "16px"
      }}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid #334155",
          padding: "40px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          color: "#f8fafc"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.35)"
            }}
          >
            🏥
          </div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "800" }}>
            Rehab System
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Sign in to access patient & bed dashboard
          </p>
        </div>

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
              background: "#22c55e",
              border: "none",
              borderRadius: "8px",
              color: "#020617",
              fontWeight: "700",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "6px"
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            fontSize: "12px",
            color: "#64748b",
            textAlign: "center",
            lineHeight: "1.5"
          }}
        >
          Staff access only. Contact your medical administrator for account provisioning.
        </p>
      </div>
    </div>
  )
}