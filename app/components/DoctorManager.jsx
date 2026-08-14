"use client"

import { useState } from "react"

export default function DoctorManager({
  doctors = [],
  activePatients = [],
  onAddDoctor,
  onDeleteDoctor,
  onSelectDoctorFilter
}) {
  const [newDoctor, setNewDoctor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Compute caseload
  const doctorStats = {}
  doctors.forEach((doc) => {
    const count = (activePatients || []).filter(
      (p) => p.physio_incharge?.trim().toLowerCase() === doc.name?.trim().toLowerCase()
    ).length
    doctorStats[doc.name] = count
  })

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newDoctor.trim()) return

    setIsSubmitting(true)
    await onAddDoctor(newDoctor.trim())
    setNewDoctor("")
    setIsSubmitting(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Add Doctor Banner */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          padding: "18px 22px",
          borderRadius: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
            👨‍⚕️ Physiotherapist & Doctor In-Charge Roster
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
            Manage staff members and monitor active clinical caseloads.
          </p>
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            placeholder="Add new Physio / Doctor..."
            value={newDoctor}
            onChange={(e) => setNewDoctor(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#080e1e",
              border: "1px solid #334155",
              color: "#f8fafc",
              fontSize: "13px",
              minWidth: "220px"
            }}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newDoctor.trim()}
            style={{
              background: "#22c55e",
              color: "#020617",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: isSubmitting || !newDoctor.trim() ? "not-allowed" : "pointer",
              opacity: isSubmitting || !newDoctor.trim() ? 0.6 : 1
            }}
          >
            ➕ Add
          </button>
        </form>
      </div>

      {/* Doctor Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px"
        }}
      >
        {doctors.map((doc) => {
          const patientCount = doctorStats[doc.name] || 0
          return (
            <div
              key={doc.id || doc.name}
              style={{
                background: "#0b132b",
                border: "1px solid #1e293b",
                borderRadius: "14px",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
                    {doc.name}
                  </h4>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Physiotherapist / Incharge</span>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: patientCount > 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.15)",
                    color: patientCount > 0 ? "#4ade80" : "#94a3b8",
                    border: `1px solid ${patientCount > 0 ? "rgba(34, 197, 94, 0.3)" : "#334155"}`
                  }}
                >
                  {patientCount} Active
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  borderTop: "1px solid #1e293b",
                  paddingTop: "12px",
                  marginTop: "auto"
                }}
              >
                <button
                  onClick={() => onSelectDoctorFilter && onSelectDoctorFilter(doc.name)}
                  style={{
                    flex: 1,
                    background: "#1e293b",
                    color: "#38bdf8",
                    border: "1px solid #334155",
                    padding: "8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  View Patients ({patientCount})
                </button>

                <button
                  onClick={() => onDeleteDoctor(doc)}
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
