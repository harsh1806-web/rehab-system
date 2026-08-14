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
import DoctorManager from "../components/DoctorManager"
import PatientTable from "../components/PatientTable"
import HistoryLog from "../components/HistoryLog"
import { ToastProvider, useToast } from "../components/Toast"

function AdminDashboardContent() {
  const router = useRouter()
  const { showToast } = useToast()

  const [role, setRole] = useState(null)
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
  const [returnPatient, setReturnPatient] = useState(null)
  const [loading, setLoading] = useState(false)

  // 1. Initial Access Check
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

    if (profile?.role !== "admin") {
      router.push("/user")
      return
    }

    setRole(profile?.role)
  }, [router])

  // 2. Data Fetchers
  const fetchPatients = useCallback(async () => {
    const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })
    if (error) console.error("Error fetching patients:", error)
    else setPatients(data || [])
  }, [])

  const fetchDoctors = useCallback(async () => {
    const { data, error } = await supabase.from("doctors").select("*").order("name", { ascending: true })
    if (error) console.error("Error fetching doctors:", error)
    else setDoctors(data || [])
  }, [])

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase.from("patient_history").select("*").order("created_at", { ascending: false }).limit(100)
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

    // Setup Supabase Realtime Subscriptions for live updates
    const patientChannel = supabase
      .channel("admin-realtime")
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

  // 3. Handlers
  const handleBedClick = (bed, patient) => {
    if (patient) {
      setSelectedPatient(patient)
      fetchTimeline(patient.id)
    } else {
      setFormMode("add")
      setEditingPatient({ bed_number: bed })
      setFormModalOpen(true)
    }
  }

  const toggleHoldBed = (bed) => {
    setHeldBeds((prev) => {
      const isHeld = prev.includes(bed)
      const next = isHeld ? prev.filter((b) => b !== bed) : [...prev, bed]
      showToast(isHeld ? `Bed ${bed} released from hold` : `Bed ${bed} marked as held`, "info")
      return next
    })
  }

  const handleSavePatient = async (formData) => {
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

    if (formMode === "add") {
      // Check bed collision
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
        .insert([
          {
            ...formData,
            status: "occupied",
            admission_date: now
          }
        ])
        .select()
        .single()

      if (insertError) {
        showToast(insertError.message || "Failed to admit patient", "error")
      } else {
        // Start rehab stay
        await supabase.from("patient_stays").insert([
          {
            patient_id: newPatient.id,
            type: "rehab",
            start_date: now
          }
        ])

        // Audit Log
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
      // Edit mode
      const { error: updateError } = await supabase
        .from("patients")
        .update({
          ...formData,
          bed_number: formData.bed_number
        })
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

  const handleShiftOut = async (patient) => {
    if (!confirm(`Shift out ${patient.name} to external hospital?`)) return

    const now = new Date().toISOString()

    // Close active rehab stay
    await supabase
      .from("patient_stays")
      .update({ end_date: now })
      .eq("patient_id", patient.id)
      .eq("type", "rehab")
      .is("end_date", null)

    // Open hospital stay
    await supabase.from("patient_stays").insert([
      {
        patient_id: patient.id,
        type: "hospital",
        start_date: now
      }
    ])

    // Update patient status & free up bed
    await supabase
      .from("patients")
      .update({
        status: "hospital",
        bed_number: null
      })
      .eq("id", patient.id)

    // Audit log
    await supabase.from("patient_history").insert([
      {
        patient_name: patient.name,
        action: "shifted_out",
        bed_number: patient.bed_number,
        physio_incharge: patient.physio_incharge
      }
    ])

    showToast(`${patient.name} shifted out to external hospital`, "warning")
    setSelectedPatient(null)
    fetchPatients()
    fetchHistory()
  }

  const handleConfirmReturn = async (patient, bed) => {
    const now = new Date().toISOString()

    // Close hospital stay
    await supabase
      .from("patient_stays")
      .update({ end_date: now })
      .eq("patient_id", patient.id)
      .eq("type", "hospital")
      .is("end_date", null)

    // Start new rehab stay
    await supabase.from("patient_stays").insert([
      {
        patient_id: patient.id,
        type: "rehab",
        start_date: now
      }
    ])

    // Assign bed & set status back to occupied
    await supabase
      .from("patients")
      .update({
        status: "occupied",
        bed_number: bed
      })
      .eq("id", patient.id)

    // Audit log
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
    fetchPatients()
    fetchHistory()
  }

  const handleDischarge = async (patient) => {
    if (!confirm(`Are you sure you want to discharge ${patient.name}?`)) return

    const now = new Date().toISOString()

    // Close any open stay
    await supabase
      .from("patient_stays")
      .update({ end_date: now })
      .eq("patient_id", patient.id)
      .is("end_date", null)

    // Update patient record
    await supabase
      .from("patients")
      .update({
        discharge_date: now,
        bed_number: null
      })
      .eq("id", patient.id)

    // Audit log
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

  const handleAddDoctor = async (name) => {
    const exists = doctors.some((d) => d.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      showToast("Physio / Doctor already exists", "error")
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

  const handleDeleteDoctor = async (doc) => {
    const hasPatients = activePatients.some((p) => p.physio_incharge === doc.name)
    if (hasPatients) {
      showToast(`Cannot delete ${doc.name}: Active patients currently assigned!`, "error")
      return
    }

    if (!confirm(`Delete ${doc.name} from roster?`)) return

    const { error } = await supabase.from("doctors").delete().eq("id", doc.id)
    if (error) {
      showToast("Failed to delete doctor", "error")
    } else {
      showToast(`Removed ${doc.name}`, "info")
      fetchDoctors()
    }
  }

  const handleSetHighlight = (patientId, color) => {
    setHighlightedPatients((prev) => {
      const copy = { ...prev }
      if (!color) delete copy[patientId]
      else copy[patientId] = color
      return copy
    })
    showToast(color ? "Color tag applied" : "Color tag removed", "info")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#f8fafc" }}>
      <Navbar role="admin" activeView={activeView} onViewChange={setActiveView} />

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
            activePatients={activePatients}
            onAddDoctor={handleAddDoctor}
            onDeleteDoctor={handleDeleteDoctor}
            onSelectDoctorFilter={(docName) => {
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
                  Patients currently receiving temporary care at external facilities.
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* View 5: Admin Discharged Archive */}
        {activeView === "admin" && (
          <PatientTable
            title="Discharged Patients Archive"
            patients={dischargedPatients}
            doctors={doctors}
            isDischargedView={true}
            doctorFilter={doctorFilter}
            onDoctorFilterChange={setDoctorFilter}
            onPatientClick={(p) => {
              setSelectedPatient(p)
              fetchTimeline(p.id)
            }}
          />
        )}

        {/* View 6: History Audit Log */}
        {activeView === "history" && <HistoryLog history={history} />}
      </main>

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          timeline={patientTimeline}
          role="admin"
          onClose={() => setSelectedPatient(null)}
          onEdit={(patient) => {
            setFormMode("edit")
            setEditingPatient(patient)
            setFormModalOpen(true)
          }}
          onShiftOut={handleShiftOut}
          onDischarge={handleDischarge}
          highlightColor={highlightedPatients[selectedPatient.id]}
          onSetHighlight={handleSetHighlight}
        />
      )}

      {/* Add / Edit Patient Form Modal */}
      {formModalOpen && (
        <PatientFormModal
          isOpen={formModalOpen}
          mode={formMode}
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
      <AdminDashboardContent />
    </ToastProvider>
  )
}
