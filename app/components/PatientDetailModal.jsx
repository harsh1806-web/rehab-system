"use client"

import { useState } from "react"
import { calculateFinalRehabDays, calculateShiftDays } from "@/lib/calculations"

export default function PatientDetailModal({
  patient,
  timeline = [],
  role = "user",
  onClose,
  onEdit,
  onShiftOut,
  onDischarge,
  highlightColor,
  onSetHighlight
}) {
  if (!patient) return null

  const [selectedColor, setSelectedColor] = useState(highlightColor || "")

  const highlightColors = [
    { name: "Red", value: "#f87171" },
    { name: "Orange", value: "#fb923c" },
    { name: "Yellow", value: "#facc15" },
    { name: "Green", value: "#4ade80" },
    { name: "Cyan", value: "#38bdf8" },
    { name: "Indigo", value: "#818cf8" },
    { name: "Purple", value: "#c084fc" },
    { name: "Pink", value: "#f472b6" },
    { name: "Gray", value: "#94a3b8" }
  ]

  const totalRehabDays = calculateFinalRehabDays(timeline)
  const totalShiftDays = calculateShiftDays(timeline)

  const isDischarged = Boolean(patient.discharge_date)
  const isShiftedOut = patient.status === "hospital"

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
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
          color: "#f8fafc",
          animation: "popupFade 0.25s ease forwards"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{patient.name}</h2>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  background: isDischarged
                    ? "rgba(148, 163, 184, 0.2)"
                    : isShiftedOut
                    ? "rgba(245, 158, 11, 0.2)"
                    : "rgba(34, 197, 94, 0.2)",
                  color: isDischarged ? "#94a3b8" : isShiftedOut ? "#f59e0b" : "#22c55e",
                  border: `1px solid ${
                    isDischarged ? "#475569" : isShiftedOut ? "#d97706" : "#16a34a"
                  }`
                }}
              >
                {isDischarged ? "Discharged" : isShiftedOut ? "Hospital Shifted Out" : `Bed ${patient.bed_number}`}
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Physio/Incharge: <b style={{ color: "#38bdf8" }}>{patient.physio_incharge || "Unassigned"}</b>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Summary Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                padding: "12px 16px",
                borderRadius: "10px"
              }}
            >
              <span style={{ fontSize: "12px", color: "#86efac" }}>Net Rehab Days</span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "22px", color: "#22c55e", fontWeight: "800" }}>
                {totalRehabDays} Days
              </h3>
            </div>

            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "12px 16px",
                borderRadius: "10px"
              }}
            >
              <span style={{ fontSize: "12px", color: "#fcd34d" }}>Shift Out Days</span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "22px", color: "#f59e0b", fontWeight: "800" }}>
                {totalShiftDays} Days
              </h3>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              background: "#080e1e",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              fontSize: "13px"
            }}
          >
            <div>
              <span style={{ color: "#64748b" }}>Age / Sex:</span>
              <p style={{ margin: "2px 0 0 0", fontWeight: "600" }}>
                {patient.age ? `${patient.age} yrs` : "N/A"} / {patient.sex || "N/A"}
              </p>
            </div>

            <div>
              <span style={{ color: "#64748b" }}>Contact Number:</span>
              <p style={{ margin: "2px 0 0 0", fontWeight: "600" }}>{patient.to_contact || "N/A"}</p>
            </div>

            <div>
              <span style={{ color: "#64748b" }}>Parent Doctor:</span>
              <p style={{ margin: "2px 0 0 0", fontWeight: "600" }}>{patient.parent_doctor || "N/A"}</p>
            </div>

            <div>
              <span style={{ color: "#64748b" }}>Parent Hospital:</span>
              <p style={{ margin: "2px 0 0 0", fontWeight: "600" }}>{patient.parent_hospital || "N/A"}</p>
            </div>

            <div>
              <span style={{ color: "#64748b" }}>Referral / Referred From:</span>
              <p style={{ margin: "2px 0 0 0", fontWeight: "600" }}>
                {patient.referred_from || patient.referral || "N/A"}
              </p>
            </div>

            <div>
              <span style={{ color: "#64748b" }}>Admission Date:</span>
              <p style={{ margin: "2px 0 0 0", fontWeight: "600" }}>
                {patient.admission_date ? new Date(patient.admission_date).toLocaleDateString() : "N/A"}
              </p>
            </div>

            {patient.discharge_date && (
              <div>
                <span style={{ color: "#64748b" }}>Discharge Date:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: "600", color: "#f87171" }}>
                  {new Date(patient.discharge_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#64748b" }}>Address:</span>
              <p style={{ margin: "2px 0 0 0", fontWeight: "500", color: "#cbd5e1" }}>
                {patient.address || "N/A"}
              </p>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#64748b" }}>Condition & Diagnosis:</span>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontWeight: "500",
                  color: "#cbd5e1",
                  background: "#020617",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #1e293b"
                }}
              >
                {patient.condition || "No clinical condition notes."}
              </p>
            </div>
          </div>

          {/* Stays Timeline */}
          <div>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#38bdf8", fontWeight: "700" }}>
              ⏱️ Stay History & Transfers ({timeline.length})
            </h4>

            {timeline.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>No stay records found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {timeline.map((stay, idx) => {
                  const isHospital = stay.type === "hospital"
                  return (
                    <div
                      key={stay.id || idx}
                      style={{
                        background: isHospital ? "rgba(245, 158, 11, 0.08)" : "rgba(34, 197, 94, 0.08)",
                        border: `1px solid ${isHospital ? "rgba(245, 158, 11, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontWeight: "700",
                            color: isHospital ? "#f59e0b" : "#22c55e",
                            textTransform: "uppercase"
                          }}
                        >
                          {isHospital ? "🏥 External Hospital Transfer" : "🛏️ Rehab Stay"}
                        </span>
                        <div style={{ color: "#94a3b8", marginTop: "2px" }}>
                          {new Date(stay.start_date).toLocaleString()} →{" "}
                          {stay.end_date ? new Date(stay.end_date).toLocaleString() : "Present"}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background: stay.end_date ? "#1e293b" : isHospital ? "#d97706" : "#16a34a",
                          color: "#ffffff"
                        }}
                      >
                        {stay.end_date ? "Completed" : "Active"}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Color Highlight Tagging (Admin Feature) */}
          {role === "admin" && onSetHighlight && (
            <div
              style={{
                background: "#080e1e",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid #1e293b",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>Tag Color:</span>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "white",
                  fontSize: "12px"
                }}
              >
                <option value="">Default (Green)</option>
                {highlightColors.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onSetHighlight(patient.id, selectedColor)}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Apply Color
              </button>

              {highlightColor && (
                <button
                  onClick={() => onSetHighlight(patient.id, null)}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Clear Tag
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #1e293b",
            background: "#080e1e",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            flexWrap: "wrap",
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px"
          }}
        >
          {!isDischarged && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(patient)}
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ✏️ Edit
                </button>
              )}

              {!isShiftedOut && onShiftOut && (
                <button
                  onClick={() => onShiftOut(patient)}
                  style={{
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  🏥 Shift Out
                </button>
              )}

              {onDischarge && (
                <button
                  onClick={() => onDischarge(patient)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  🚪 Discharge
                </button>
              )}
            </>
          )}

          <button
            onClick={onClose}
            style={{
              background: "#334155",
              color: "#f8fafc",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
