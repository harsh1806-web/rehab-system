"use client"

import { useState } from "react"

export default function DoctorDiagnosisModal({
  patient,
  onSave,
  onClose,
  loading = false
}) {
  if (!patient) return null

  const [condition, setCondition] = useState(patient.condition || "")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(patient, condition.trim())
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(2, 6, 23, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "500px",
          padding: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
          color: "#f8fafc",
          animation: "popupFade 0.25s ease forwards"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}
          >
            🩺
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Update Clinical Diagnosis</h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Patient: <b>{patient.name}</b> {patient.bed_number ? `(Bed ${patient.bed_number})` : ""}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
              Condition / Medical Diagnosis Notes *
            </label>
            <textarea
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                borderRadius: "8px",
                background: "#080e1e",
                border: "1px solid #334155",
                color: "#f8fafc",
                fontSize: "13px",
                boxSizing: "border-box",
                resize: "vertical"
              }}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Enter updated clinical diagnosis, progress summary, rehabilitation notes, medication plans..."
              required
              autoFocus
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#22c55e",
                color: "#020617",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Saving..." : "Save Diagnosis"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#334155",
                color: "#f8fafc",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
