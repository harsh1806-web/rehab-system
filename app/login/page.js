"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      const { data: userData } = await supabase.auth.getUser()

const userId = userData.user.id

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", userId)
  .single()

const role = profile?.role

console.log("ROLE:", role)

if (role === "admin") {
  router.push("/admin")
} else {
  router.push("/user")
}
    }
  }

  return (
  <div style={{
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #0f172a, #020617)"
  }}>
    <div style={{
      background: "#1e293b",
      padding: "40px",
      borderRadius: "12px",
      width: "350px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
    }}>

      <h2 style={{ color: "white", marginBottom: "20px" }}>
        Login
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "none",
          background: "#334155",
          color: "white"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "none",
          background: "#334155",
          color: "white"
        }}
      />

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "10px",
          background: "#22c55e",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Login
      </button>

    </div>
  </div>
)
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "none",
  outline: "none",
  background: "#334155",
  color: "white"
}

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#22c55e",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
}