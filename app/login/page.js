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
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      
      <h2 className="text-2xl font-semibold text-white text-center mb-6">
        Welcome Back
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <button
        onClick={handleLogin}
        className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 transition text-white font-medium"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-center text-slate-400 mt-4">
        No account?{" "}
        <span
          className="text-green-400 cursor-pointer"
          onClick={() => router.push("/register")}
        >
          Register
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