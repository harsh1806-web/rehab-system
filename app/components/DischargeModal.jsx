"use client"

import { useState } from "react"

export default function DischargeModal({
  patient,
  onConfirm,
  onClose,
  loading = false
}) {
  if (!patient) return null

  // Format local current timestamp: YYYY-MM-DDTHH:mm
  const getNowLocal = () => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, "0")
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  }

  const [dischargeDateTime, setDischargeDateTime] = useState(getNowLocal())
  const [notes, setNotes] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!dischargeDateTime) return
    const isoDateTime = new Date(dischargeDateTime).toISOString()
    onConfirm(patient, isoDateTime, notes.trim())
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
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}
          >
            🚪
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Discharge Patient</h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Patient: <b>{patient.name}</b> {patient.bed_number ? `(Bed ${patient.bed_number})` : ""}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Discharge Date & Time *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={dischargeDateTime}
              onChange={(e) => setDischargeDateTime(e.target.value)}
              required
            />
            <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
              Select the actual discharge date and time when the patient left.
            </span>
          </div>

          <div>
            <label style={labelStyle}>Discharge Summary / Notes (Optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
              placeholder="e.g. Completed rehab protocol, discharged home, stable condition..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fca5a5"
            }}
          >
            ⚠️ Discharging will close all active stays, release Bed <b>{patient.bed_number || "N/A"}</b>, and archive the patient record.
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={!dischargeDateTime || loading}
              style={{
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: !dischargeDateTime || loading ? "not-allowed" : "pointer",
                opacity: !dischargeDateTime || loading ? 0.6 : 1
              }}
            >
              {loading ? "Discharging..." : "Confirm Discharge"}
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
