"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div style={{ padding: "100px", textAlign: "center", color: "white" }}>
      <h1>Rehab System</h1>

      <br />

      <button onClick={() => router.push("/login")}>
        Login
      </button>

      <br /><br />

      <button onClick={() => router.push("/register")}>
        Register
      </button>
    </div>
  )
}