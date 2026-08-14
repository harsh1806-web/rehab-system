"use client"

import { useState, useMemo } from "react"

export default function PatientTable({
  title = "Patients",
  patients = [],
  doctors = [],
  isDischargedView = false,
  doctorFilter = "",
  onDoctorFilterChange,
  onPatientClick,
  onAddClick,
  highlightedPatients = {}
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bed_number?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.physio_incharge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.to_contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchDoctor = !doctorFilter || p.physio_incharge === doctorFilter

      return matchSearch && matchDoctor
    })
  }, [patients, searchTerm, doctorFilter])

  const exportCSV = () => {
    if (filteredPatients.length === 0) return

    const headers = [
      "Bed",
      "Name",
      "Age",
      "Sex",
      "Contact",
      "Address",
      "Physio Incharge",
      "Condition",
      "Parent Doctor",
      "Parent Hospital",
      "Referred From",
      "Referral",
      "Admission Date",
      ...(isDischargedView ? ["Discharge Date"] : [])
    ]

    const rows = filteredPatients.map((p) => [
      `"${p.bed_number || ""}"`,
      `"${p.name || ""}"`,
      `"${p.age || ""}"`,
      `"${p.sex || ""}"`,
      `"${p.to_contact || ""}"`,
      `"${p.address?.replace(/"/g, '""') || ""}"`,
      `"${p.physio_incharge || ""}"`,
      `"${p.condition?.replace(/"/g, '""') || ""}"`,
      `"${p.parent_doctor || ""}"`,
      `"${p.parent_hospital || ""}"`,
      `"${p.referred_from || ""}"`,
      `"${p.referral || ""}"`,
      `"${p.admission_date ? p.admission_date.slice(0, 10) : ""}"`,
      ...(isDischargedView ? [`"${p.discharge_date ? p.discharge_date.slice(0, 10) : ""}"`] : [])
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `${isDischargedView ? "discharged_patients" : "active_patients"}_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const thStyle = {
    padding: "12px 14px",
    textAlign: "left",
    background: "#1e293b",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #334155"
  }

  const tdStyle = {
    padding: "12px 14px",
    borderBottom: "1px solid #1e293b",
    color: "#f8fafc",
    fontSize: "13px",
    whiteSpace: "nowrap"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Controls Bar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          <input
            placeholder="🔍 Search by name, bed, physio, condition, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#080e1e",
              border: "1px solid #334155",
              color: "#f8fafc",
              fontSize: "13px",
              minWidth: "280px",
              flex: "1 1 240px"
            }}
          />

          <select
            value={doctorFilter}
            onChange={(e) => onDoctorFilterChange && onDoctorFilterChange(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#080e1e",
              border: "1px solid #334155",
              color: "#f8fafc",
              fontSize: "13px",
              minWidth: "180px"
            }}
          >
            <option value="">All Physio / Incharges</option>
            {doctors.map((doc) => (
              <option key={doc.id || doc.name} value={doc.name}>
                {doc.name}
              </option>
            ))}
          </select>

          {doctorFilter && (
            <button
              onClick={() => onDoctorFilterChange && onDoctorFilterChange("")}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Clear Filter ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {onAddClick && (
            <button
              onClick={onAddClick}
              style={{
                background: "#22c55e",
                color: "#020617",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ➕ Admit Patient
            </button>
          )}

          <button
            onClick={exportCSV}
            disabled={filteredPatients.length === 0}
            style={{
              background: "#1e293b",
              color: "#38bdf8",
              border: "1px solid #334155",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: filteredPatients.length === 0 ? "not-allowed" : "pointer",
              opacity: filteredPatients.length === 0 ? 0.5 : 1
            }}
          >
            📥 Export CSV ({filteredPatients.length})
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div
        style={{
          background: "#0b132b",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          overflowX: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Bed</th>
              <th style={thStyle}>Patient Name</th>
              <th style={thStyle}>Age/Sex</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Physio Incharge</th>
              <th style={thStyle}>Condition</th>
              <th style={thStyle}>Parent Doctor</th>
              <th style={thStyle}>Hospital</th>
              <th style={thStyle}>Admission</th>
              {isDischargedView && <th style={thStyle}>Discharge</th>}
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan={isDischargedView ? 10 : 9}
                  style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "14px" }}
                >
                  No patient records matching current criteria.
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => {
                const customBg = highlightedPatients[p.id]
                return (
                  <tr
                    key={p.id}
                    onClick={() => onPatientClick && onPatientClick(p)}
                    style={{
                      cursor: "pointer",
                      background: customBg ? `${customBg}22` : "transparent",
                      borderLeft: customBg ? `4px solid ${customBg}` : "4px solid transparent",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = customBg ? `${customBg}44` : "rgba(30, 41, 59, 0.7)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = customBg ? `${customBg}22` : "transparent"
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: "700", color: "#38bdf8" }}>
                      {p.bed_number ? `Bed ${p.bed_number}` : "-"}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "600" }}>{p.name}</td>
                    <td style={tdStyle}>
                      {p.age ? `${p.age}y` : "-"} / {p.sex || "-"}
                    </td>
                    <td style={tdStyle}>{p.to_contact || "-"}</td>
                    <td style={{ ...tdStyle, color: "#a5f3fc" }}>{p.physio_incharge || "-"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: "240px",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={p.condition}
                    >
                      {p.condition || "-"}
                    </td>
                    <td style={tdStyle}>{p.parent_doctor || "-"}</td>
                    <td style={tdStyle}>{p.parent_hospital || "-"}</td>
                    <td style={tdStyle}>{p.admission_date ? p.admission_date.slice(0, 10) : "-"}</td>
                    {isDischargedView && (
                      <td style={{ ...tdStyle, color: "#f87171" }}>
                        {p.discharge_date ? p.discharge_date.slice(0, 10) : "-"}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
