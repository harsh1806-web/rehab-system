"use client"

import { useState } from "react"

export default function HistoryLog({ history = [] }) {
  const [filter, setFilter] = useState("")

  const filteredHistory = history.filter((h) => {
    if (!filter.trim()) return true
    return (
      h.patient_name?.toLowerCase().includes(filter.toLowerCase()) ||
      h.action?.toLowerCase().includes(filter.toLowerCase()) ||
      h.physio_incharge?.toLowerCase().includes(filter.toLowerCase()) ||
      h.bed_number?.toString().toLowerCase().includes(filter.toLowerCase())
    )
  })

  const getActionBadge = (action = "") => {
    const act = action.toLowerCase()
    let bg = "rgba(148, 163, 184, 0.2)"
    let text = "#94a3b8"
    let label = action

    if (act.includes("admitted")) {
      bg = "rgba(34, 197, 94, 0.2)"
      text = "#4ade80"
      label = "🟢 Admitted"
    } else if (act.includes("discharged")) {
      bg = "rgba(239, 68, 68, 0.2)"
      text = "#f87171"
      label = "🚪 Discharged"
    } else if (act.includes("shifted") || act.includes("hospital")) {
      bg = "rgba(245, 158, 11, 0.2)"
      text = "#fbbf24"
      label = "🏥 Shifted Out"
    } else if (act.includes("return")) {
      bg = "rgba(56, 189, 248, 0.2)"
      text = "#38bdf8"
      label = "↩️ Returned"
    } else if (act.includes("transfer") || act.includes("bed")) {
      bg = "rgba(168, 85, 247, 0.2)"
      text = "#c084fc"
      label = "🛏️ Bed Moved"
    }

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "700",
          background: bg,
          color: text
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search Header */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          padding: "16px 20px",
          borderRadius: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
            📜 System Activity & Audit Log
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
            Real-time chronological timeline of patient admissions, bed moves, hospital transfers, and discharges.
          </p>
        </div>

        <input
          placeholder="Filter audit history..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            background: "#080e1e",
            border: "1px solid #334155",
            color: "#f8fafc",
            fontSize: "13px",
            minWidth: "220px"
          }}
        />
      </div>

      {/* History Timeline Cards */}
      <div
        style={{
          background: "#0b132b",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        {filteredHistory.length === 0 ? (
          <p style={{ textAlign: "center", padding: "30px", color: "#64748b", margin: 0, fontSize: "14px" }}>
            No audit log entries recorded.
          </p>
        ) : (
          filteredHistory.map((h, i) => (
            <div
              key={h.id || i}
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "10px",
                padding: "12px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {getActionBadge(h.action)}
                <div>
                  <b style={{ color: "#f8fafc", fontSize: "14px" }}>{h.patient_name}</b>
                  {h.bed_number && (
                    <span style={{ color: "#94a3b8", fontSize: "13px", marginLeft: "8px" }}>
                      (Bed {h.bed_number})
                    </span>
                  )}
                  {h.physio_incharge && (
                    <span style={{ color: "#38bdf8", fontSize: "12px", marginLeft: "8px" }}>
                      • {h.physio_incharge}
                    </span>
                  )}
                </div>
              </div>

              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {h.created_at ? new Date(h.created_at).toLocaleString() : "Just now"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
