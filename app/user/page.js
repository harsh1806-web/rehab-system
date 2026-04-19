"use client"
import { useRouter } from "next/navigation" 
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function UserDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState([])
  const [beds, setBeds] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: patientData } = await supabase
      .from("patients")
      .select("*")

    const { data: bedData } = await supabase
      .from("beds")
      .select("*")

    setPatients(patientData || [])
    setBeds(bedData || [])
  }
  const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push("/login")
}

  return (
  <div style={{ padding: "30px", color: "white" }}>

    {/* 🔝 Top Bar */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px"
    }}>
      <h1>User Dashboard</h1>

      <button
        onClick={handleLogout}
        style={{
          background: "#ef4444",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
      <h1 style={{ marginBottom: "20px" }}>User Dashboard</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        
        {/* Patients Card */}
        <div style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          width: "200px"
        }}>
          <h3>Total Patients</h3>
          <p style={{ fontSize: "24px" }}>{patients.length}</p>
        </div>

        {/* Beds Card */}
        <div style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          width: "200px"
        }}>
          <h3>Total Beds</h3>
          <p style={{ fontSize: "24px" }}>{beds.length}</p>
        </div>

      </div>

      {/* Patient List */}
      <div style={{ marginTop: "30px" }}>
        <h2>Patients</h2>

        {patients.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No patients found</p>
        ) : (
          patients.map((p) => (
            <div key={p.id} style={{
              background: "#334155",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "6px"
            }}>
              {p.name} - {p.condition}
            </div>
          ))
        )}
      </div>
    </div>
  )
}