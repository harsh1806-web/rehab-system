"use client"

import { useState } from "react"

export default function ShiftOutModal({
  patient,
  onConfirm,
  onClose,
  loading = false
}) {
  if (!patient) return null

  const [destination, setDestination] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!destination.trim()) return
    onConfirm(patient, destination.trim(), reason.trim())
  }

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#080e1e",
    border: "1px solid #334155",
    color: "#f8fafc",
    fontSize: "13px",
    width: "100%",
    boxSizing: "border-box"
  }

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "6px",
    fontWeight: "600"
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
          maxWidth: "460px",
          padding: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
          color: "#f8fafc",
          animation: "popupFade 0.25s ease forwards"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}
          >
            🏥
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Shift Out Patient</h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Transfer <b>{patient.name}</b> (Bed {patient.bed_number || "N/A"})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Destination Hospital / Facility *</label>
            <input
              style={inputStyle}
              placeholder="e.g. City General Hospital ICU, Apex Clinic..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>Reason / Transfer Notes (Optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
              placeholder="e.g. Acute respiratory distress, emergency surgery, specialized imaging..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fbbf24"
            }}
          >
            ℹ️ Shifting out will release Bed <b>{patient.bed_number}</b> and log an external hospital stay.
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={!destination.trim() || loading}
              style={{
                background: "#f59e0b",
                color: "#020617",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: !destination.trim() || loading ? "not-allowed" : "pointer",
                opacity: !destination.trim() || loading ? 0.6 : 1
              }}
            >
              {loading ? "Processing..." : "Confirm Shift Out"}
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
