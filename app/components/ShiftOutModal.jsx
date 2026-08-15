"use client"

import { useState } from "react"

export default function ShiftOutModal({
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

  const [destination, setDestination] = useState("")
  const [shiftDateTime, setShiftDateTime] = useState(getNowLocal())
  const [reason, setReason] = useState("")
  const [bedAction, setBedAction] = useState("release") // "release" | "hold"

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!destination.trim() || !shiftDateTime) return
    const isoDateTime = new Date(shiftDateTime).toISOString()
    onConfirm(patient, destination.trim(), reason.trim(), isoDateTime, bedAction === "hold")
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
          maxWidth: "480px",
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
              Transfer <b>{patient.name}</b> {patient.bed_number ? `(Bed ${patient.bed_number})` : ""}
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
            <label style={labelStyle}>Shift Out Date & Time *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={shiftDateTime}
              onChange={(e) => setShiftDateTime(e.target.value)}
              required
            />
            <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
              Select the actual date and time when the patient was shifted out.
            </span>
          </div>

          {/* Bed Allocation Action: Release vs Keep on Hold */}
          {patient.bed_number && (
            <div>
              <label style={labelStyle}>Bed Allocation Action for Bed {patient.bed_number} *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setBedAction("release")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: bedAction === "release" ? "rgba(34, 197, 94, 0.15)" : "#080e1e",
                    border: `1px solid ${bedAction === "release" ? "#22c55e" : "#334155"}`,
                    color: bedAction === "release" ? "#4ade80" : "#94a3b8",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div>🔓 Release Bed</div>
                  <div style={{ fontSize: "10px", fontWeight: "400", marginTop: "2px", opacity: 0.8 }}>
                    Free up Bed {patient.bed_number} for new admissions
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBedAction("hold")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: bedAction === "hold" ? "rgba(249, 115, 22, 0.15)" : "#080e1e",
                    border: `1px solid ${bedAction === "hold" ? "#f97316" : "#334155"}`,
                    color: bedAction === "hold" ? "#fb923c" : "#94a3b8",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div>🔒 Keep Bed on Hold</div>
                  <div style={{ fontSize: "10px", fontWeight: "400", marginTop: "2px", opacity: 0.8 }}>
                    Reserve Bed {patient.bed_number} while away
                  </div>
                </button>
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Reason / Transfer Notes (Optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              placeholder="e.g. Acute respiratory distress, emergency surgery, specialized imaging..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div
            style={{
              background: bedAction === "hold" ? "rgba(249, 115, 22, 0.08)" : "rgba(245, 158, 11, 0.08)",
              border: `1px solid ${bedAction === "hold" ? "rgba(249, 115, 22, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              color: bedAction === "hold" ? "#fb923c" : "#fbbf24"
            }}
          >
            {bedAction === "hold"
              ? `🔒 Bed ${patient.bed_number} will be marked as HELD / RESERVED on the Bed Map.`
              : `🔓 Bed ${patient.bed_number || "N/A"} will be RELEASED and available for new patients.`}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={!destination.trim() || !shiftDateTime || loading}
              style={{
                background: "#f59e0b",
                color: "#020617",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: !destination.trim() || !shiftDateTime || loading ? "not-allowed" : "pointer",
                opacity: !destination.trim() || !shiftDateTime || loading ? 0.6 : 1
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
