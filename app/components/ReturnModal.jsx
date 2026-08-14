"use client"

import { useState } from "react"

export default function ReturnModal({
  patient,
  availableBeds = [],
  onConfirm,
  onClose,
  loading = false
}) {
  if (!patient) return null

  const [selectedBed, setSelectedBed] = useState(availableBeds[0] || "")

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
        zIndex: 1000,
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
          maxWidth: "420px",
          padding: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
          color: "#f8fafc",
          animation: "popupFade 0.25s ease forwards"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "24px" }}>🏥</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Return Patient to Rehab</h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Re-assign bed for <b>{patient.name}</b>
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
            Select Available Rehab Bed *
          </label>
          <select
            value={selectedBed}
            onChange={(e) => setSelectedBed(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#080e1e",
              border: "1px solid #334155",
              color: "#f8fafc",
              fontSize: "14px"
            }}
          >
            <option value="">Select Bed</option>
            {availableBeds.map((bed) => (
              <option key={bed} value={bed}>
                Bed {bed}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={() => onConfirm(patient, selectedBed)}
            disabled={!selectedBed || loading}
            style={{
              background: "#22c55e",
              color: "#020617",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: !selectedBed || loading ? "not-allowed" : "pointer",
              opacity: !selectedBed || loading ? 0.6 : 1
            }}
          >
            {loading ? "Assigning..." : "Confirm Return"}
          </button>

          <button
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
      </div>
    </div>
  )
}
