"use client"

import { useState, useEffect } from "react"
import { calculateAge } from "@/lib/calculations"

export default function PatientFormModal({
  isOpen,
  mode = "add", // "add" | "edit"
  role = "admin", // "admin" | "administrator" | "receptionist" | "doctor"
  initialData = null,
  availableBeds = [],
  doctors = [],
  onClose,
  onSave,
  onHoldBed,
  onAddDoctor,
  loading = false
}) {
  if (!isOpen) return null

  const isReceptionist = role === "receptionist"

  const [form, setForm] = useState({
    name: "",
    birthdate: "",
    sex: "Male",
    address: "",
    to_contact_1: "",
    to_contact_2: "",
    to_contact_3: "",
    to_contact_4: "",
    physio_incharge: "",
    condition: "",
    parent_doctor: "",
    parent_hospital: "",
    referred_from: "", // Label: "Rehab under"
    referral: "",      // Label: "Refered from/refered to"
    bed_number: ""
  })

  const [newDoctorName, setNewDoctorName] = useState("")
  const [showDoctorInput, setShowDoctorInput] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        birthdate: initialData.birthdate ? initialData.birthdate.slice(0, 10) : "",
        bed_number: initialData.bed_number || "",
        to_contact_1: initialData.to_contact_1 || initialData.to_contact || "",
        to_contact_2: initialData.to_contact_2 || "",
        to_contact_3: initialData.to_contact_3 || "",
        to_contact_4: initialData.to_contact_4 || ""
      })
    } else {
      setForm({
        name: "",
        birthdate: "",
        sex: "Male",
        address: "",
        to_contact_1: "",
        to_contact_2: "",
        to_contact_3: "",
        to_contact_4: "",
        physio_incharge: doctors[0]?.name || "",
        condition: "",
        parent_doctor: "",
        parent_hospital: "",
        referred_from: "",
        referral: "",
        bed_number: availableBeds[0] || ""
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateDoctor = async () => {
    if (!newDoctorName.trim()) return
    if (onAddDoctor) {
      await onAddDoctor(newDoctorName.trim())
      setForm((prev) => ({ ...prev, physio_incharge: newDoctorName.trim() }))
      setNewDoctorName("")
      setShowDoctorInput(false)
    }
  }

  const computedAge = calculateAge(form.birthdate)

  // Build the list of selectable beds
  const selectableBeds = [...availableBeds]
  if (mode === "edit" && form.bed_number && !selectableBeds.includes(form.bed_number)) {
    selectableBeds.unshift(form.bed_number)
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
    marginBottom: "4px",
    fontWeight: "600"
  }

  const handleFormSubmit = () => {
    const combinedContact = [form.to_contact_1, form.to_contact_2, form.to_contact_3, form.to_contact_4]
      .filter(Boolean)
      .join(", ")

    onSave({
      ...form,
      to_contact: combinedContact || form.to_contact_1,
      age: computedAge
    })
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
          maxWidth: "680px",
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
            padding: "18px 24px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>{mode === "edit" ? "✏️" : "➕"}</span>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              {mode === "edit" ? "Edit Patient Details" : "Admit New Patient"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "20px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Name & Bed */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Patient Full Name *</label>
              <input
                style={inputStyle}
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Bed Allocation *</label>
              <select
                style={inputStyle}
                name="bed_number"
                value={form.bed_number || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Bed</option>
                {selectableBeds.map((bed) => (
                  <option key={bed} value={bed}>
                    Bed {bed} {mode === "edit" && bed === initialData?.bed_number ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Birthdate, Computed Age, Sex */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 120px", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input
                type="date"
                style={inputStyle}
                name="birthdate"
                value={form.birthdate || ""}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label style={labelStyle}>Age</label>
              <input
                style={{ ...inputStyle, background: "#020617", color: "#38bdf8", fontWeight: "700" }}
                value={computedAge !== "" ? `${computedAge} yrs` : "-"}
                readOnly
              />
            </div>

            <div>
              <label style={labelStyle}>Sex</label>
              <select style={inputStyle} name="sex" value={form.sex || "Male"} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 3: 4 Contact Fields */}
          <div style={{ background: "#080e1e", border: "1px solid #1e293b", borderRadius: "12px", padding: "14px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#38bdf8", display: "block", marginBottom: "10px" }}>
              📞 Patient Contact Details (Up to 4 Contacts)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Contact 1 (Primary) *</label>
                <input
                  style={inputStyle}
                  name="to_contact_1"
                  value={form.to_contact_1 || ""}
                  onChange={handleChange}
                  placeholder="Primary phone / Attendant"
                />
              </div>

              <div>
                <label style={labelStyle}>Contact 2 (Secondary)</label>
                <input
                  style={inputStyle}
                  name="to_contact_2"
                  value={form.to_contact_2 || ""}
                  onChange={handleChange}
                  placeholder="Secondary phone"
                />
              </div>

              <div>
                <label style={labelStyle}>Contact 3 (Emergency)</label>
                <input
                  style={inputStyle}
                  name="to_contact_3"
                  value={form.to_contact_3 || ""}
                  onChange={handleChange}
                  placeholder="Emergency contact 3"
                />
              </div>

              <div>
                <label style={labelStyle}>Contact 4 (Other)</label>
                <input
                  style={inputStyle}
                  name="to_contact_4"
                  value={form.to_contact_4 || ""}
                  onChange={handleChange}
                  placeholder="Emergency contact 4"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Physio / Incharge Selector */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Physio / Incharge *</label>
              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => setShowDoctorInput(!showDoctorInput)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#38bdf8",
                    fontSize: "11px",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  {showDoctorInput ? "Cancel" : "+ New Physio"}
                </button>
              )}
            </div>

            {showDoctorInput ? (
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  style={inputStyle}
                  placeholder="Doctor Name"
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleCreateDoctor}
                  style={{
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    padding: "0 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                style={inputStyle}
                name="physio_incharge"
                value={form.physio_incharge || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Physio/Inch</option>
                {doctors.map((doc) => (
                  <option key={doc.id || doc.name} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 5: Address */}
          <div>
            <label style={labelStyle}>Address</label>
            <input
              style={inputStyle}
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              placeholder="Residential address"
            />
          </div>

          {/* Row 6: Condition & Diagnosis (LOCKED / Read-Only for Receptionist when editing) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Condition / Medical Diagnosis</label>
              {isReceptionist && mode === "edit" && (
                <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "600" }}>
                  🔒 Read-Only (Doctors & Admin Only)
                </span>
              )}
            </div>
            <textarea
              style={{
                ...inputStyle,
                minHeight: "60px",
                resize: "vertical",
                background: isReceptionist && mode === "edit" ? "#030712" : "#080e1e",
                color: isReceptionist && mode === "edit" ? "#94a3b8" : "#f8fafc",
                cursor: isReceptionist && mode === "edit" ? "not-allowed" : "text"
              }}
              name="condition"
              value={form.condition || ""}
              onChange={handleChange}
              readOnly={isReceptionist && mode === "edit"}
              placeholder={
                isReceptionist && mode === "edit"
                  ? "Medical diagnosis cannot be edited by receptionist."
                  : "Clinical condition, diagnosis, surgery notes..."
              }
            />
          </div>

          {/* Row 7: Parent Hospital & Parent Doctor (HIDDEN for Receptionist) */}
          {!isReceptionist && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Parent Doctor</label>
                <input
                  style={inputStyle}
                  name="parent_doctor"
                  value={form.parent_doctor || ""}
                  onChange={handleChange}
                  placeholder="Referring Physician"
                />
              </div>

              <div>
                <label style={labelStyle}>Parent Hospital</label>
                <input
                  style={inputStyle}
                  name="parent_hospital"
                  value={form.parent_hospital || ""}
                  onChange={handleChange}
                  placeholder="Referring Hospital"
                />
              </div>
            </div>
          )}

          {/* Row 8: Rehab under & Refered from/refered to (HIDDEN for Receptionist) */}
          {!isReceptionist && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Rehab under</label>
                <input
                  style={inputStyle}
                  name="referred_from"
                  value={form.referred_from || ""}
                  onChange={handleChange}
                  placeholder="Rehab under (e.g. Neuro Rehab, Ortho...)"
                />
              </div>

              <div>
                <label style={labelStyle}>Refered from/refered to</label>
                <input
                  style={inputStyle}
                  name="referral"
                  value={form.referral || ""}
                  onChange={handleChange}
                  placeholder="Refered from / Refered to details"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #1e293b",
            background: "#080e1e",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px"
          }}
        >
          {mode === "add" && onHoldBed && form.bed_number && (
            <button
              type="button"
              onClick={() => onHoldBed(form.bed_number)}
              style={{
                background: "#f97316",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              🔒 Hold Bed {form.bed_number}
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleFormSubmit}
            style={{
              background: "#22c55e",
              color: "#020617",
              border: "none",
              padding: "10px 22px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Admit Patient"}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#334155",
              color: "#f8fafc",
              border: "none",
              padding: "10px 18px",
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
