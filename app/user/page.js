"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { bedLayout } from "@/lib/bedLayout"

export default function User() {
  const router = useRouter()

  const [role, setRole] = useState(null)
  const [view, setView] = useState("beds")
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [newDoctor, setNewDoctor] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "",
    condition: "",
    address: "",
    contact: "",
    reference: "",
    admission_date: "",
    doctor: "",
    bed_number: ""
  })

  const activePatients = patients.filter(p => !p.discharge_date)

  useEffect(() => {
    checkAccess()
    fetchPatients()
    fetchDoctors()
  }, [])

  const checkAccess = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profile?.role !== "user") {
      router.push("/admin")
    }

    setRole(profile?.role)
  }

  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("*")
    setPatients(data || [])
  }

  const fetchDoctors = async () => {
    const { data } = await supabase.from("doctors").select("*")
    setDoctors(data || [])
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)

    await supabase.from("patients").insert([{
      ...form,
      bed_number: Number(form.bed_number),
      admission_date: new Date().toISOString()
    }])

    setLoading(false)
    setShowForm(false)
    fetchPatients()
  }

  const handleDischarge = async () => {
    await supabase
      .from("patients")
      .update({ discharge_date: new Date().toISOString() })
      .eq("id", selectedPatient.id)

    setSelectedPatient(null)
    fetchPatients()
  }

  const handleAddDoctor = async () => {
    await supabase.from("doctors").insert([{ name: newDoctor }])
    setNewDoctor("")
    fetchDoctors()
  }

  return (
    <div style={{ background: "#020617", color: "white", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px",
        background: "#0f172a"
      }}>
        <h2>🏥 User Dashboard</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setView("beds")}>Beds</button>
          <button onClick={() => setView("patients")}>Patients</button>
          <button onClick={() => setView("doctors")}>Doctors</button>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/login")
            }}
            style={{ background: "red", color: "white" }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* BEDS */}
        {view === "beds" && (
          <div>
            <h2>Bed Layout</h2>

            {bedLayout.map((floor) => (
              <div key={floor.floor} style={{ marginTop: "20px" }}>
                <h3>{floor.floor}</h3>

                {floor.zones.map((zone) => (
                  <div key={zone.name} style={{
                    background: "#020617",
                    padding: "10px",
                    borderRadius: "10px",
                    marginTop: "10px"
                  }}>
                    <h4>{zone.name}</h4>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {zone.beds.map((bedNumber) => {
                        const patient = activePatients.find(
                          p => Number(p.bed_number) === bedNumber
                        )

                        return (
                          <button
                            key={bedNumber}
                            onClick={() => {
                              if (patient) {
                                setSelectedPatient(patient)
                              } else {
                                setShowForm(true)
                                setForm({ ...form, bed_number: bedNumber })
                              }
                            }}
                            style={{
                              width: "60px",
                              height: "50px",
                              background: patient ? "#ef4444" : "#22c55e",
                              borderRadius: "8px"
                            }}
                          >
                            {bedNumber}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* PATIENTS */}
        {view === "patients" && (
          <div>
            <button onClick={() => setShowForm(true)}>➕ Add Patient</button>

            <input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {activePatients
              .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
              .map(p => (
                <div key={p.id} onClick={() => setSelectedPatient(p)}>
                  {p.name} (Bed {p.bed_number})
                </div>
              ))}
          </div>
        )}

        {/* DOCTORS */}
        {view === "doctors" && (
          <div>
            <input
              value={newDoctor}
              onChange={(e) => setNewDoctor(e.target.value)}
              placeholder="Add doctor"
            />
            <button onClick={handleAddDoctor}>Add</button>

            {doctors.map(d => (
              <div key={d.id}>{d.name}</div>
            ))}
          </div>
        )}

      </div>

      {/* PATIENT MODAL */}
      {selectedPatient && (
        <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)", background: "#1e293b", padding: "20px" }}>
          <h3>{selectedPatient.name}</h3>

          <button onClick={() => {
            setEditMode(true)
            setForm(selectedPatient)
          }}>
            Edit
          </button>

          <button onClick={handleDischarge}>Discharge</button>

          <button onClick={() => setSelectedPatient(null)}>Close</button>
        </div>
      )}

      {/* ADD FORM */}
      {showForm && (
        <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)", background: "#1e293b", padding: "20px" }}>
          <input name="name" onChange={handleChange} placeholder="Name" />
          <input name="age" onChange={handleChange} placeholder="Age" />

          <select name="doctor" onChange={handleChange}>
            <option>Select Doctor</option>
            {doctors.map(d => <option key={d.id}>{d.name}</option>)}
          </select>

          <button onClick={handleSubmit}>Save</button>
          <button onClick={() => setShowForm(false)}>Close</button>
        </div>
      )}

      {/* EDIT */}
      {editMode && (
        <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)", background: "#1e293b", padding: "20px" }}>
          <input name="name" value={form.name} onChange={handleChange} />

          <button onClick={async () => {
            await supabase.from("patients").update(form).eq("id", selectedPatient.id)
            setEditMode(false)
            setSelectedPatient(null)
            fetchPatients()
          }}>
            Save
          </button>

          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      )}

    </div>
  )
}