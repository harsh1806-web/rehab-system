"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { hospitalLayout } from "@/lib/hospitalLayout"
import Navbar from "../components/Navbar"
import StatCards from "../components/StatCards"
import BedGrid from "../components/BedGrid"
import PatientDetailModal from "../components/PatientDetailModal"
import PatientFormModal from "../components/PatientFormModal"
import ReturnModal from "../components/ReturnModal"
import ShiftOutModal from "../components/ShiftOutModal"
import DoctorDiagnosisModal from "../components/DoctorDiagnosisModal"
import DoctorManager from "../components/DoctorManager"
import PatientTable from "../components/PatientTable"
import HistoryLog from "../components/HistoryLog"
import { ToastProvider, useToast } from "../components/Toast"

function DashboardContent() {
  const router = useRouter()
  const { showToast } = useToast()

  const [role, setRole] = useState("admin") // "admin" | "administrator" | "receptionist" | "doctor"
  const [activeView, setActiveView] = useState("beds")
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [history, setHistory] = useState([])
  const [heldBeds, setHeldBeds] = useState([])
  const [highlightedPatients, setHighlightedPatients] = useState({})
  const [doctorFilter, setDoctorFilter] = useState("")

  // Modal States
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientTimeline, setPatientTimeline] = useState([])
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState("add") // "add" | "edit"
  const [editingPatient, setEditingPatient] = useState(null)
  const [shiftOutPatient, setShiftOutPatient] = useState(null)
  const [returnPatient, setReturnPatient] = useState(null)
  const [doctorDiagnosisPatient, setDoctorDiagnosisPatient] = useState(null)
  const [loading, setLoading] = useState(false)

  // 1. Initial Access Check & Role Discovery
  const checkAccess = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single()

    const detectedRole = profile?.role || "admin"
    setRole(detectedRole)
  }, [router])

  // 2. Data Fetchers
  const fetchPatients = useCallback(async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching patients:", error)
    else setPatients(data || [])
  }, [])

  const fetchDoctors = useCallback(async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("name", { ascending: true })

    if (error) console.error("Error fetching doctors:", error)
    else setDoctors(data || [])
  }, [])

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from("patient_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) console.error("Error fetching history:", error)
    else setHistory(data || [])
  }, [])

  const fetchTimeline = useCallback(async (patientId) => {
    if (!patientId) return
    const { data, error } = await supabase
      .from("patient_stays")
      .select("*")
      .eq("patient_id", patientId)
      .order("start_date", { ascending: true })

    if (error) console.error("Error fetching timeline:", error)
    else setPatientTimeline(data || [])
  }, [])

  useEffect(() => {
    checkAccess()
    fetchPatients()
    fetchDoctors()
    fetchHistory()

    // Supabase Realtime Subscriptions for live updates
    const patientChannel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () => fetchPatients())
      .on("postgres_changes", { event: "*", schema: "public", table: "patient_history" }, () => fetchHistory())
      .on("postgres_changes", { event: "*", schema: "public", table: "doctors" }, () => fetchDoctors())
      .subscribe()

    return () => {
      supabase.removeChannel(patientChannel)
    }
  }, [checkAccess, fetchPatients, fetchDoctors, fetchHistory])

  // Computed Bed Sets
  const allBeds = []
  hospitalLayout.ground.forEach((block) => block.zones.forEach((z) => z.beds.forEach((b) => allBeds.push(b))))
  hospitalLayout.first.forEach((block) => block.zones.forEach((z) => z.beds.forEach((b) => allBeds.push(b))))

  const activePatients = (patients || []).filter((p) => !p.discharge_date && p.status !== "hospital")
  const hospitalPatients = (patients || []).filter((p) => p.status === "hospital" && !p.discharge_date)
  const dischargedPatients = (patients || []).filter((p) => Boolean(p.discharge_date))

  const occupiedBedNumbers = new Set(activePatients.map((p) => p.bed_number?.toString().trim().toUpperCase()))
  const availableBeds = allBeds.filter(
    (bed) => !occupiedBedNumbers.has(bed.toString().trim().toUpperCase()) && !heldBeds.includes(bed)
  )

  const isDoctor = role === "doctor"
  const isReceptionist = role === "receptionist"
  const isAdministrator = role === "administrator"
  const isAdmin = role === "admin"
  const canAdmitOrEdit = isAdmin || isReceptionist

  // 3. Handlers
  const handleBedClick = (bed, patient) => {
    if (patient) {
      setSelectedPatient(patient)
      fetchTimeline(patient.id)
    } else {
      if (!canAdmitOrEdit) {
        showToast(`Bed ${bed} is currently empty.`, "info")
        return
      }
      setFormMode("add")
      setEditingPatient({ bed_number: bed })
      setFormModalOpen(true)
    }
  }

  const toggleHoldBed = (bed) => {
    if (!canAdmitOrEdit) return
    setHeldBeds((prev) => {
      const isHeld = prev.includes(bed)
      const next = isHeld ? prev.filter((b) => b !== bed) : [...prev, bed]
      showToast(isHeld ? `Bed ${bed} released from hold` : `Bed ${bed} marked as held`, "info")
      return next
    })
  }

  const handleSavePatient = async (formData) => {
    if (!canAdmitOrEdit) {
      showToast("Unauthorized to modify patient records", "error")
      return
    }

    if (!formData.name?.trim()) {
      showToast("Please enter patient name", "error")
      return
    }
    if (!formData.physio_incharge) {
      showToast("Please select a Physio / Incharge", "error")
      return
    }
    if (!formData.bed_number) {
      showToast("Please select a bed", "error")
      return
    }

    setLoading(true)

    // Build payload ensuring 4 contacts and clean fields
    const payload = {
      name: formData.name.trim(),
      birthdate: formData.birthdate || null,
      age: formData.age || null,
      sex: formData.sex || "Male",
      address: formData.address || "",
      to_contact_1: formData.to_contact_1 || "",
      to_contact_2: formData.to_contact_2 || "",
      to_contact_3: formData.to_contact_3 || "",
      to_contact_4: formData.to_contact_4 || "",
      to_contact: formData.to_contact || formData.to_contact_1 || "",
      physio_incharge: formData.physio_incharge,
      condition: formData.condition || "",
      bed_number: formData.bed_number,
      ...(!isReceptionist
        ? {
            parent_doctor: formData.parent_doctor || "",
            parent_hospital: formData.parent_hospital || "",
            referred_from: formData.referred_from || "",
            referral: formData.referral || ""
          }
        : {})
    }

    if (formMode === "add") {
      const isOccupied = activePatients.some(
        (p) => p.bed_number?.toString().trim().toUpperCase() === formData.bed_number.toString().trim().toUpperCase()
      )
      if (isOccupied) {
        showToast(`Bed ${formData.bed_number} is already occupied`, "error")
        setLoading(false)
        return
      }

      const now = new Date().toISOString()
      const { data: newPatient, error: insertError } = await supabase
        .from("patients")
        .insert([{ ...payload, status: "occupied", admission_date: now }])
        .select()
        .single()

      if (insertError) {
        showToast(insertError.message || "Failed to admit patient", "error")
      } else {
        await supabase.from("patient_stays").insert([
          {
            patient_id: newPatient.id,
            type: "rehab",
            start_date: now
          }
        ])

        await supabase.from("patient_history").insert([
          {
            patient_name: formData.name,
            action: "admitted",
            bed_number: formData.bed_number,
            physio_incharge: formData.physio_incharge
          }
        ])

        showToast(`Patient ${formData.name} admitted to Bed ${formData.bed_number}!`, "success")
        setFormModalOpen(false)
        fetchPatients()
        fetchHistory()
      }
    } else {
      const { error: updateError } = await supabase
        .from("patients")
        .update(payload)
        .eq("id", editingPatient.id)

      if (updateError) {
        showToast(updateError.message || "Failed to update patient", "error")
      } else {
        await supabase.from("patient_history").insert([
          {
            patient_name: formData.name,
            action: "updated",
            bed_number: formData.bed_number,
            physio_incharge: formData.physio_incharge
          }
        ])

        showToast("Patient record updated successfully", "success")
        setFormModalOpen(false)
        setSelectedPatient(null)
        fetchPatients()
        fetchHistory()
      }
    }

    setLoading(false)
  }

  const handleConfirmShiftOut = async (patient, destination, reason) => {
    if (!canAdmitOrEdit) return
    setLoading(true)
    const now = new Date().toISOString()

    // 1. Close active rehab stay
    await supabase
      .from("patient_stays")
      .update({ end_date: now })
      .eq("patient_id", patient.id)
      .eq("type", "rehab")
      .is("end_date", null)

    // 2. Open hospital stay with destination
    await supabase.from("patient_stays").insert([
      {
        patient_id: patient.id,
        type: "hospital",
        destination: destination,
        start_date: now
      }
    ])

    // 3. Update patient status & free up bed
    await supabase
      .from("patients")
      .update({
        status: "hospital",
        bed_number: null,
        parent_hospital: destination || patient.parent_hospital
      })
      .eq("id", patient.id)

    // 4. Audit log
    await supabase.from("patient_history").insert([
      {
        patient_name: patient.name,
        action: `shifted_out to ${destination}`,
        bed_number: patient.bed_number,
        physio_incharge: patient.physio_incharge
      }
    ])

    showToast(`${patient.name} shifted out to ${destination}`, "warning")
    setShiftOutPatient(null)
    setSelectedPatient(null)
    setLoading(false)
    fetchPatients()
    fetchHistory()
  }

  const handleConfirmReturn = async (patient, bed) => {
    if (!canAdmitOrEdit) return
    setLoading(true)
    const now = new Date().toISOString()

    await supabase
      .from("patient_stays")
      .update({ end_date: now })
      .eq("patient_id", patient.id)
      .eq("type", "hospital")
      .is("end_date", null)

    await supabase.from("patient_stays").insert([
      {
        patient_id: patient.id,
        type: "rehab",
        start_date: now
      }
    ])

    await supabase
      .from("patients")
      .update({
        status: "occupied",
        bed_number: bed
      })
      .eq("id", patient.id)

    await supabase.from("patient_history").insert([
      {
        patient_name: patient.name,
        action: "returned",
        bed_number: bed,
        physio_incharge: patient.physio_incharge
      }
    ])

    showToast(`${patient.name} returned to Bed ${bed}`, "success")
    setReturnPatient(null)
    setLoading(false)
    fetchPatients()
    fetchHistory()
  }

  const handleDischarge = async (patient) => {
    if (!canAdmitOrEdit) return
    if (!confirm(`Are you sure you want to discharge ${patient.name}?`)) return

    const now = new Date().toISOString()

    await supabase
      .from("patient_stays")
      .update({ end_date: now })
      .eq("patient_id", patient.id)
      .is("end_date", null)

    await supabase
      .from("patients")
      .update({
        discharge_date: now,
        bed_number: null
      })
      .eq("id", patient.id)

    await supabase.from("patient_history").insert([
      {
        patient_name: patient.name,
        action: "discharged",
        bed_number: patient.bed_number,
        physio_incharge: patient.physio_incharge
      }
    ])

    showToast(`${patient.name} discharged successfully`, "success")
    setSelectedPatient(null)
    fetchPatients()
    fetchHistory()
  }

  const handleSaveDiagnosis = async (patient, newCondition) => {
    setLoading(true)
    const { error } = await supabase
      .from("patients")
      .update({ condition: newCondition })
      .eq("id", patient.id)

    if (error) {
      showToast("Failed to update diagnosis", "error")
    } else {
      await supabase.from("patient_history").insert([
        {
          patient_name: patient.name,
          action: "diagnosis_updated",
          bed_number: patient.bed_number,
          physio_incharge: patient.physio_incharge
        }
      ])

      showToast(`Updated diagnosis for ${patient.name}`, "success")
      setDoctorDiagnosisPatient(null)
      if (selectedPatient && selectedPatient.id === patient.id) {
        setSelectedPatient({ ...selectedPatient, condition: newCondition })
      }
      fetchPatients()
      fetchHistory()
    }
    setLoading(false)
  }

  const handleAddDoctor = async (name) => {
    if (!isAdmin) {
      showToast("Only Admin can add new doctors", "error")
      return
    }

    const exists = doctors.some((d) => d.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      showToast("Doctor already registered", "error")
      return
    }

    const { error } = await supabase.from("doctors").insert([{ name: name.trim() }])
    if (error) {
      showToast("Failed to add doctor", "error")
    } else {
      showToast(`Added ${name} to roster`, "success")
      fetchDoctors()
    }
  }

  const handleDeleteDoctor = async (docId, docName) => {
    if (!isAdmin) return
    const hasPatients = activePatients.some((p) => p.physio_incharge === docName)
    if (hasPatients) {
      showToast(`Cannot delete ${docName}: Active patients currently assigned!`, "error")
      return
    }

    if (!confirm(`Delete ${docName} from roster?`)) return

    const { error } = await supabase.from("doctors").delete().eq("id", docId)
    if (error) {
      showToast("Failed to delete doctor", "error")
    } else {
      showToast(`Removed ${docName}`, "info")
      fetchDoctors()
    }
  }

  const handleSetHighlight = (patientId, color) => {
    if (!isAdmin) return
    setHighlightedPatients((prev) => {
      const copy = { ...prev }
      if (!color) delete copy[patientId]
      else copy[patientId] = color
      return copy
    })
    showToast(color ? "Color tag applied" : "Color tag removed", "info")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#f8fafc" }}>
      <Navbar
        currentView={activeView}
        onSelectView={setActiveView}
        role={role}
        onLogout={handleLogout}
        occupancyCount={activePatients.length}
        totalBeds={allBeds.length}
        shiftedCount={hospitalPatients.length}
      />

      <main style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Stat Overview */}
        <StatCards
          totalBeds={allBeds.length}
          occupied={activePatients.length}
          available={availableBeds.length}
          hospital={hospitalPatients.length}
        />

        {/* View 1: Beds Layout */}
        {activeView === "beds" && (
          <BedGrid
            activePatients={activePatients}
            heldBeds={heldBeds}
            onHoldToggle={toggleHoldBed}
            onBedClick={handleBedClick}
            highlightedPatients={highlightedPatients}
          />
        )}

        {/* View 2: Active Patients Table */}
        {activeView === "patients" && (
          <PatientTable
            title="Active Patients"
            patients={activePatients}
            doctors={doctors}
            role={role}
            doctorFilter={doctorFilter}
            onDoctorFilterChange={setDoctorFilter}
            onPatientClick={(p) => {
              setSelectedPatient(p)
              fetchTimeline(p.id)
            }}
            onAddClick={() => {
              setFormMode("add")
              setEditingPatient(null)
              setFormModalOpen(true)
            }}
            highlightedPatients={highlightedPatients}
          />
        )}

        {/* View 3: Physio / Doctor Manager */}
        {activeView === "doctors" && (
          <DoctorManager
            doctors={doctors}
            patients={activePatients}
            role={role}
            onAddDoctor={handleAddDoctor}
            onDeleteDoctor={handleDeleteDoctor}
            onDoctorClick={(docName) => {
              setDoctorFilter(docName)
              setActiveView("patients")
            }}
          />
        )}

        {/* View 4: Shifted Out / Hospital Transferred */}
        {activeView === "hospital" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                padding: "16px 20px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>🏥 Hospital Shifted-Out Patients</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
                  Patients temporarily receiving care at external medical facilities.
                </p>
              </div>
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#fbbf24",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: "1px solid rgba(245, 158, 11, 0.3)"
                }}
              >
                {hospitalPatients.length} Outside Facility
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {hospitalPatients.length === 0 ? (
                <p style={{ color: "#64748b", padding: "30px", margin: 0 }}>No patients currently shifted out.</p>
              ) : (
                hospitalPatients.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "#0b132b",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "14px",
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{p.name}</h4>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{p.age ? `${p.age}y` : ""} {p.sex}</span>
                      </div>
                      <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
                        Physio: <b style={{ color: "#38bdf8" }}>{p.physio_incharge}</b>
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#cbd5e1" }}>
                        Condition: {p.condition || "N/A"}
                      </p>
                      {p.parent_hospital && (
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#fbbf24" }}>
                          📍 Transferred To: <b>{p.parent_hospital}</b>
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => {
                          setSelectedPatient(p)
                          fetchTimeline(p.id)
                        }}
                        style={{
                          flex: 1,
                          background: "#1e293b",
                          color: "#cbd5e1",
                          border: "1px solid #334155",
                          padding: "8px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        View Dossier
                      </button>

                      {canAdmitOrEdit && (
                        <button
                          onClick={() => setReturnPatient(p)}
                          style={{
                            flex: 1,
                            background: "#22c55e",
                            color: "#020617",
                            border: "none",
                            padding: "8px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          ↩️ Return to Bed
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* View 5: Discharged Patients Archive (Admin & Administrator Only) */}
        {activeView === "discharged" && !isReceptionist && !isDoctor && (
          <PatientTable
            title="Discharged Patients Archive"
            patients={dischargedPatients}
            doctors={doctors}
            role={role}
            isDischargedView={true}
            doctorFilter={doctorFilter}
            onDoctorFilterChange={setDoctorFilter}
            onPatientClick={(p) => {
              setSelectedPatient(p)
              fetchTimeline(p.id)
            }}
          />
        )}

        {/* View 6: History Audit Log (Admin & Administrator Only) */}
        {activeView === "history" && !isReceptionist && !isDoctor && (
          <HistoryLog history={history} />
        )}
      </main>

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          timeline={patientTimeline}
          role={role}
          onClose={() => setSelectedPatient(null)}
          onEdit={(patient) => {
            setFormMode("edit")
            setEditingPatient(patient)
            setFormModalOpen(true)
          }}
          onShiftOut={(patient) => {
            setShiftOutPatient(patient)
          }}
          onDischarge={handleDischarge}
          onOpenDoctorDiagnosis={(patient) => {
            setDoctorDiagnosisPatient(patient)
          }}
          highlightColor={highlightedPatients[selectedPatient.id]}
          onSetHighlight={handleSetHighlight}
        />
      )}

      {/* Shift Out Destination Modal */}
      {shiftOutPatient && (
        <ShiftOutModal
          patient={shiftOutPatient}
          onConfirm={handleConfirmShiftOut}
          onClose={() => setShiftOutPatient(null)}
          loading={loading}
        />
      )}

      {/* Doctor Condition / Diagnosis Editor Modal */}
      {doctorDiagnosisPatient && (
        <DoctorDiagnosisModal
          patient={doctorDiagnosisPatient}
          onSave={handleSaveDiagnosis}
          onClose={() => setDoctorDiagnosisPatient(null)}
          loading={loading}
        />
      )}

      {/* Add / Edit Patient Form Modal */}
      {formModalOpen && (
        <PatientFormModal
          isOpen={formModalOpen}
          mode={formMode}
          role={role}
          initialData={editingPatient}
          availableBeds={availableBeds}
          doctors={doctors}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSavePatient}
          onHoldBed={toggleHoldBed}
          onAddDoctor={handleAddDoctor}
          loading={loading}
        />
      )}

      {/* Return to Rehab Modal */}
      {returnPatient && (
        <ReturnModal
          patient={returnPatient}
          availableBeds={availableBeds}
          onConfirm={handleConfirmReturn}
          onClose={() => setReturnPatient(null)}
          loading={loading}
        />
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  )
}
