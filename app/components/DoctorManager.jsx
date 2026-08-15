"use client"

import { useState } from "react"

export default function DoctorManager({
  doctors = [],
  patients = [],
  role = "admin", // "admin" | "administrator" | "receptionist" | "doctor"
  onAddDoctor,
  onDeleteDoctor,
  onDoctorClick
}) {
  const [newDoctorName, setNewDoctorName] = useState("")
  const [loading, setLoading] = useState(false)

  const isAdmin = role === "admin"

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newDoctorName.trim()) return
    setLoading(true)
    await onAddDoctor(newDoctorName.trim())
    setNewDoctorName("")
    setLoading(false)
  }

  // Calculate caseload per doctor
  const doctorStats = doctors.map((doc) => {
    const docPatients = patients.filter((p) => p.physio_incharge === doc.name && !p.discharge_date)
    return {
      ...doc,
      activeCount: docPatients.length
    }
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Add Doctor Bar (Admin Only) */}
      {isAdmin && (
        <form
          onSubmit={handleAdd}
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            padding: "16px 20px",
            borderRadius: "14px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <input
            placeholder="Enter Doctor / Physio full name (e.g. Dr. Sarah Jenkins)..."
            value={newDoctorName}
            onChange={(e) => setNewDoctorName(e.target.value)}
            required
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#080e1e",
              border: "1px solid #334155",
              color: "#f8fafc",
              fontSize: "13px",
              flex: "1 1 300px"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#22c55e",
              color: "#020617",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Adding..." : "➕ Add Physio / Incharge"}
          </button>
        </form>
      )}

      {/* Doctor Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px"
        }}
      >
        {doctorStats.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px",
              color: "#64748b",
              background: "#0f172a",
              borderRadius: "14px",
              border: "1px solid #1e293b"
            }}
          >
            No doctors or physio incharge registered in system yet.
          </div>
        ) : (
          doctorStats.map((doc) => (
            <div
              key={doc.id || doc.name}
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "14px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
                transition: "transform 0.15s ease, border-color 0.15s ease",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
                    {doc.name}
                  </h4>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Physio Incharge</span>
                </div>

                <span
                  style={{
                    background: doc.activeCount > 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(100, 116, 139, 0.15)",
                    border: `1px solid ${doc.activeCount > 0 ? "rgba(34, 197, 94, 0.4)" : "#334155"}`,
                    color: doc.activeCount > 0 ? "#4ade80" : "#94a3b8",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  {doc.activeCount} Patients
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: "12px" }}>
                <button
                  onClick={() => onDoctorClick && onDoctorClick(doc.name)}
                  style={{
                    background: "#1e293b",
                    color: "#38bdf8",
                    border: "1px solid #334155",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  View Patients →
                </button>

                {isAdmin && onDeleteDoctor && (
                  <button
                    onClick={() => onDeleteDoctor(doc.id, doc.name)}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    Delete ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
