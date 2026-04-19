"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Register() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("worker")
  const [loading, setLoading] = useState(false)

 const handleRegister = async () => {
  setLoading(true)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    setLoading(false)
    alert(error.message)
    return
  }
  const handleRegister = async () => {
  setLoading(true)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    setLoading(false)
    alert(error.message)
    return
  }

  const userId = data.user.id

  // 🔥 UPDATE PROFILE WITH ROLE
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: role })
    .eq("id", userId)

  if (updateError) {
    console.log(updateError)
    alert("Role update failed")
  }

  setLoading(false)
  alert("Registered successfully!")
  router.push("/login")
}

  // 🔥 IMPORTANT: FORCE SAVE ROLE
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      role: role,
    },
  })

  setLoading(false)

  if (updateError) {
    alert("Registered but role not saved")
  } else {
    alert("Registered successfully!")
    router.push("/login")
  }
}

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
        width: "320px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{ color: "white", marginBottom: "20px", textAlign: "center" }}>
          Register
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* ROLE SELECT */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={handleRegister} style={buttonStyle}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={{ color: "#94a3b8", marginTop: "15px", textAlign: "center" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#22c55e", cursor: "pointer" }}
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
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