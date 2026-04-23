"use client"

import { hospitalLayout } from "@/lib/hospitalLayout"
import  ZoneBox  from "../components/ZoneBox"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Admin() {
  const router = useRouter()

useEffect(() => {
  checkAccess()
  fetchUserRole()
  fetchPatients()
  fetchDoctors()
  fetchHistory()
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

if (profile?.role !== "admin") {
  router.push("/user")
}
}

    const [showReturnModal, setShowReturnModal] = useState(false)
const [returnPatient, setReturnPatient] = useState(null)
const [selectedBed, setSelectedBed] = useState("")
    const [timeline, setTimeline] = useState([])
    const [role, setRole] = useState(null)
    const [view, setView] = useState("beds")
    const [history, setHistory] = useState([])
    const [editMode, setEditMode] = useState(false)
    const [doctorFilter, setDoctorFilter] = useState(null)
    const [newDoctor, setNewDoctor] = useState("")
   const [doctors, setDoctors] = useState([])
    const [search, setSearch] = useState("")
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [patients, setPatients] = useState([])
    const [dischargeSearch, setDischargeSearch] = useState("")
    const [adminSearch, setAdminSearch] = useState("")
    const activePatients = (patients || []).filter(
  p => !p.discharge_date && p.status !== "hospital"

)
const hospitalPatients = (patients || []).filter(
  p => p.status === "hospital" && !p.discharge_date
)
    const dischargedPatients = patients.filter(p => p.discharge_date !== null)
    const doctorStats = {}

doctors.forEach((doc) => {
  const count = activePatients.filter(
    (p) => p.physio_incharge === doc.name
  ).length

  doctorStats[doc.name] = count
})
    
  const [loading, setLoading] = useState(false)
const [showForm, setShowForm] = useState(false)

const [form, setForm] = useState({
  name: "",
  birthdate: "",
  sex: "",
  address: "",
  to_contact: "",
  physio_incharge: "",
  condition: "",
  parent_doctor: "",
  parent_hospital: "",
  referred_from: "",
  referral: "",
  admission_date: "",
  bed_number: ""
})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const fetchPatients = async () => {
  const { data, error } = await supabase
    .from("patients")
    .select("*")

  if (error) {
    console.log(error)
  } else {
    setPatients(data)
  }
}


const fetchUserRole = async () => {
  const { data: userData } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single()

  if (profile?.role !== "admin") {
    router.push("/user")
  }

  setRole(profile?.role)   // ✅ FIXED
}
  const fetchDoctors = async () => {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")

  if (error) {
    console.log(error)
  } else {
    setDoctors(data)
  }
}
const calculateRehabDays = (stays) => {
  let total = 0

  stays.forEach((stay) => {
    if (stay.type !== "rehab") return

    const start = new Date(stay.start_date)
    const end = stay.end_date ? new Date(stay.end_date) : new Date()

    // ✅ Calculate difference in days
    let days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1

    // ✅ Admit after 10 AM → remove first day
    if (start.getHours() >= 10) {
      days -= 1
    }

    // ✅ Discharge before 10 AM → remove last day
    if (stay.end_date && end.getHours() < 10) {
      days -= 1
    }

    if (days < 0) days = 0

    total += days
  })

  return total
}
const calculateShiftDays = (stays) => {
  let total = 0

  stays.forEach((stay) => {
    if (stay.type === "hospital") {   // 👈 your "shift out"
      const start = new Date(stay.start_date)
      const end = stay.end_date
        ? new Date(stay.end_date)
        : new Date()

      const diff = (end - start) / (1000 * 60 * 60 * 24)
      total += diff
    }
  })

  return Math.floor(total)
}
const fetchHistory = async () => {
  const { data } = await supabase
    .from("patient_history")
    .select("*")
    .order("created_at", { ascending: false })

  setHistory(data)
}

  const handleSubmit = async () => {
    if (!form.physio_incharge) {
  alert("Please select a Physio/Inch")
  return
}
  if (loading) return   // ⛔ prevent double click

  setLoading(true)

  const { data, error } = await supabase
  .from("patients")
 .insert([{
  ...form,
  age: calculateAge(form.birthdate),   // 👈 THIS LINE ADDED
  status: "occupied",
  bed_number: form.bed_number,
  admission_date: new Date().toLocaleString("sv-SE")
}])
  .select()
  .single()
  console.log("PATIENT DATA:", data)
console.log("PATIENT ERROR:", error)

  if (error) {
    alert(error.message)
    console.log(error)
  } else {
    alert("Patient added ✅")
    // ✅ Create first rehab stay
const now = new Date().toISOString()

const { error: stayError } = await supabase
  .from("patient_stays")
  .insert([{
    patient_id: data.id,
    type: "rehab",
    start_date: now
  }])

if (stayError) {
  console.log("❌ Admission stay error:", stayError)
} else {
  console.log("✅ Stay inserted")
}

if (stayError) {
  console.log("❌ Admission stay error:", stayError)
}
      await supabase.from("patient_history").insert([{
  patient_name: form.name,
  action: "admitted",
 bed_number: form.bed_number,
  physio_incharge: form.physio_incharge
}])

fetchPatients()
fetchHistory()
  }

  setLoading(false)
}
const handleDischarge = async () => {
  if (!selectedPatient) return

  const confirmDelete = confirm("Discharge this patient?")
  if (!confirmDelete) return

  const { error } = await supabase
    .from("patients")
    .update({
  discharge_date: new Date().toLocaleString("sv-SE")
})
    .eq("id", selectedPatient.id)

  if (error) {
  alert("Error discharging patient")
  console.log(error)
} else {
  alert("Patient discharged ✅")

  fetchPatients()   // ✅ VERY IMPORTANT
  setSelectedPatient(null)  // close popup


fetchHistory()   // 👈 ADD THIS
    await supabase.from("patient_history").insert([{
  patient_name: selectedPatient.name,
  action: "discharged",
  bed_number: selectedPatient.bed_number,
  physio_incharge: selectedPatient.physio_incharge
}])
  }
}
const th = {
  padding: "12px",
  textAlign: "left",
  background: "#1e293b",
  color: "#cbd5f5",
  minWidth: "120px"   // 🔥 IMPORTANT
}

const td = {
  padding: "12px",
  borderTop: "1px solid #1e293b",
  color: "#e2e8f0",
  textAlign: "left",
  verticalAlign: "top",
  minWidth: "120px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}

const handleAddDoctor = async () => {
  if (!newDoctor.trim()) {
    return alert("Enter doctor name")
  }

  // ✅ normalize input
  const doctorName = newDoctor.trim().toLowerCase()

  // 🔍 check existing doctors (case insensitive)
  const exists = doctors.find(
    (d) => d.name.toLowerCase() === doctorName
  )

  if (exists) {
    alert("Physio/Inch already exists ❌")
    return
  }

  const { error } = await supabase
    .from("doctors")
    .insert([{ name: newDoctor.trim() }])

  if (error) {
    console.log(error)
    alert("Error adding doctor")
  } else {
    setNewDoctor("")
    fetchDoctors()
  }
}
const cardStyle = {
  flex: 1,
  background: "#0f172a",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #1e293b",
  transition: "all 0.3s ease",
  cursor: "pointer"
}


const allBeds = []

// Ground floor beds
hospitalLayout.ground.forEach(block =>
  block.zones.forEach(zone =>
    zone.beds.forEach(bed => allBeds.push(bed))
  )
)

// First floor beds
hospitalLayout.first.forEach(block =>
  block.zones.forEach(zone =>
    zone.beds.forEach(bed => allBeds.push(bed))
  )
)

// Filter available beds
const availableBeds = allBeds.filter(bed =>
  !activePatients.find(
    p => p.bed_number?.toString().trim().toUpperCase() === bed.toString().trim().toUpperCase() && p.id !== selectedPatient?.id
  )
)
const combinedLayout = {}

hospitalLayout.ground.forEach(block => {
  if (!combinedLayout[block.block]) {
    combinedLayout[block.block] = { ground: [], first: [] }
  }
  combinedLayout[block.block].ground = block.zones
})

hospitalLayout.first.forEach(block => {
  if (!combinedLayout[block.block]) {
    combinedLayout[block.block] = { ground: [], first: [] }
  }
  combinedLayout[block.block].first = block.zones
})
if (role === "user" && view === "admin") {
  return (
    <div style={{ color: "white", padding: "50px" }}>
      ❌ Access Denied
    </div>
  )
}
const fetchTimeline = async (patientId) => {
  const { data } = await supabase
    .from("patient_stays")
    .select("*")
    .eq("patient_id", patientId)
    .order("start_date", { ascending: true })

  setTimeline(data || [])
}
useEffect(() => {
  if (selectedPatient) {
    fetchTimeline(selectedPatient.id)
  }
}, [selectedPatient])
const calculateAge = (birthdate) => {
  if (!birthdate) return ""

  const today = new Date()
  const birth = new Date(birthdate)

  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

 return (
  <div style={{
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    fontFamily: "sans-serif"
  }}>
    <style>
{`
@keyframes popupFade {
  from {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
`}
</style>
   

  {/* 🔥 TOP NAVBAR */}

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b"
  }}>
    <h2 style={{ margin: 0 }}>🏥 Rehab Dashboard</h2>

    <div style={{ display: "flex", gap: "10px" }}>
      <button
  onClick={async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }}
  style={{
    background: "#ef4444",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  }}
>
  Logout
</button>
      <button
        onClick={() => setView("beds")}
        style={{
          background: view === "beds" ? "#22c55e" : "#1e293b",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Beds
      </button>

      <button
        onClick={() => setView("patients")}
        style={{
          background: view === "patients" ? "#22c55e" : "#1e293b",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Patients
      </button>

      <button
        onClick={() => setView("doctors")}
        style={{
          background: view === "doctors" ? "#22c55e" : "#1e293b",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Physio/Inch
      </button>
      
{role === "admin" && (
      <button
        onClick={() => setView("admin")}
        style={{
          background: view === "admin" ? "#22c55e" : "#1e293b",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Admin
      </button>
)}
<button
  onClick={() => setView("hospital")}
  style={{
    background: view === "hospital" ? "#22c55e" : "#1e293b",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px"
  }}
>
  Shift Out
</button>
    </div>
  </div>
  <div style={{
    display: "flex",
    flexDirection: "column",
  padding: "20px",
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
  animation: "fadeIn 0.2s ease"
}}>
    
    

    {/* LEFT SECTION */}
    <div style={{
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  flexWrap: "wrap"
}}>

  <div style={cardStyle}>
    <p>Total Beds</p>
    <h2>{allBeds.length}</h2>
  </div>

  <div style={cardStyle}>
    <p>Occupied</p>
    <h2>{activePatients.length}</h2>
  </div>

  <div style={cardStyle}>
    <p>Available</p>
    <h2>{allBeds.length - activePatients.length}</h2>
  </div>

</div>
    {view === "beds" && (
  <div style={{
    display: "block"   // ✅ IMPORTANT FIX
  }}>

    {/* LEGEND */}
    

    {view === "beds" && (
  <div style={{ display: "block" }}>

    {Object.keys(combinedLayout).map((blockName) => {
      const block = combinedLayout[blockName]

      return (
        <div key={blockName} style={{ marginBottom: "30px" }}>
          
          <div style={{
  background: "#facc15",        // same yellow as zones
  color: "black",
  fontWeight: "bold",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "10px",
  textAlign: "center",
  fontSize: "18px",
  boxShadow: "0 0 10px #facc15"
}}>
  🏢 {blockName}
</div>

          {/* Ground Floor */}
          {block.ground.length > 0 && (
            <>
              <h3 style={{ color: "#38bdf8" }}>Ground Floor</h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                {block.ground.map((zone) => (
                  <ZoneBox
                    key={zone.title}
                    title={zone.title}
                    beds={zone.beds}
                    columns={zone.columns}
                    activePatients={activePatients}
                    onBedClick={(bed, patient) => {
                      if (patient) {
                        setSelectedPatient(patient)
                        fetchTimeline(patient.id)
                      } else {
                        setShowForm(true)
                        setForm({ ...form, bed_number: bed })
                      }
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* First Floor */}
          {block.first.length > 0 && (
            <>
              <h3 style={{ color: "#f97316" }}>First Floor</h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                {block.first.map((zone) => (
                  <ZoneBox
                    key={zone.title}
                    title={zone.title}
                    beds={zone.beds}
                    columns={zone.columns}
                    activePatients={activePatients}
                    onBedClick={(bed, patient) => {
                      if (patient) {
                        setSelectedPatient(patient)
                        fetchTimeline(patient.id)
                      } else {
                        setShowForm(true)
                        setForm({ ...form, bed_number: bed })
                      }
                    }}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      )
    })}

  </div>
)}
</div>
    )}

    {/* RIGHT SECTION */}
    {view === "patients" && (
  <div style={{ flex: 2, background: "#0f172a", padding: "20px", borderRadius: "10px", margin: "20px" }}>
      <h2>All Patients</h2>
      {doctorFilter && (
  <button
    onClick={() => setDoctorFilter(null)}
    style={{
      marginBottom: "10px",
      padding: "6px 10px",
      background: "#ef4444",
      border: "none",
      borderRadius: "6px",
      color: "white",
      cursor: "pointer"
    }}
  >
    Clear Filter ({doctorFilter})
  </button>
)}
      <button
  onClick={() => setShowForm(true)}
  style={{
    marginBottom: "10px",
    padding: "8px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  ➕ Add Patient
</button>
      <input
  placeholder="Search patient..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    marginBottom: "10px",
    padding: "8px",
    width: "100%",
    borderRadius: "6px",
    border: "none"
  }}
/>
<select
  value={doctorFilter}
  onChange={(e) => setDoctorFilter(e.target.value)}
  style={{
    marginBottom: "10px",
    padding: "8px",
    width: "100%",
    borderRadius: "6px"
  }}
>
  <option value="">All Physio/Inch</option>

  {doctors.map((doc) => (
    <option
  key={doc.id}
  value={doc.name}
  style={{ background: "#020617", color: "white" }}
>
      {doc.name}
    </option>
  ))}
</select>

     <div style={{ overflowX: "auto", width: "100%" }}>
  <table style={{
    borderCollapse: "collapse",
    width: "max-content",   // 🔥 KEY FIX
    minWidth: "100%",
    background: "#020617",
    borderRadius: "10px"
  }}>
  <thead style={{ background: "#1e293b" }}>
    <tr>
      <th style={th}>Name</th>
<th style={th}>Age</th>
<th style={th}>Sex</th>
<th style={th}>Address</th>
<th style={th}>2 Contact</th>
<th style={th}>Physio/Inch</th>
<th style={th}>Condition</th>
<th style={th}>Parent Doctor</th>
<th style={th}>Hospital</th>
<th style={th}>Reference</th>
<th style={th}>Refferal</th>
<th style={th}>Admission</th>
<th style={th}>Discharge</th>
<th style={th}>Bed</th>
    </tr>
  </thead>

  <tbody>
    {activePatients
  .filter(p =>
  p.name?.toLowerCase().includes(search.toLowerCase()) &&
  (doctorFilter ? p.physio_incharge === doctorFilter : true)
)
  .map((p) => (
      <tr
  key={p.id}
  style={{ cursor: "pointer" }}
  onClick={() => {
    setSelectedPatient(p)          // ✅ open popup
    fetchTimeline(p.id)            // ✅ load timeline
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#1e293b"
    e.currentTarget.style.transform = "scale(1.01)"
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "transparent"
    e.currentTarget.style.transform = "scale(1)"
  }}
>
<td style={td}>{p.name}</td>
<td style={td}>{p.age}</td>
<td style={td}>{p.sex}</td>
<td style={{
  ...td,
  minWidth: "200px",
  maxWidth: "250px",
  whiteSpace: "normal",
  wordBreak: "break-word"
}}>
  {p.address}
</td>
<td style={td}>{p.to_contact}</td>
<td style={td}>{p.physio_incharge}</td>
<td style={{
    ...td,
  minWidth: "250px",
  maxWidth: "300px",
  whiteSpace: "normal",
  wordBreak: "break-word"
}}>
  {p.condition}
</td>
<td style={td}>{p.parent_doctor}</td>
<td style={td}>{p.parent_hospital}</td>
<td style={td}>{p.referred_from}</td>
<td style={td}>{p.referral}</td>
<td style={td}>{p.admission_date?.slice(0,10)}</td>
<td style={td}>{p.discharge_date?.slice(0,10) || "-"}</td>
<td style={td}>{p.bed_number}</td>

      </tr>
    ))}
  </tbody>
</table>
</div>
<h3 style={{ marginTop: "20px" }}>📜 History</h3>
{history.map((h) => (
  <div key={h.id} style={{
    padding: "10px",
    marginTop: "5px",
    background: "#1e293b",
    borderRadius: "6px"
  }}>
    {h.patient_name} → {h.action} (Bed {h.bed_number})
  </div>
))}


</div>
)}

<div style={{
  flex: 1,
  background: "#0f172a",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #1e293b"
}}>

  <h3>Total Beds</h3>
  <h1 style={{ color: "#22c55e" }}>{allBeds.length}</h1>

  <hr style={{ borderColor: "#1e293b" }} />

  <p>🟩 Empty: {allBeds.length - activePatients.length}</p>
  <p>🟥 Occupied: {activePatients.length}</p>

</div>

{view === "history" && (
  <div style={{ padding: "20px" }}>
    <h2>📜 History</h2>

    {history.map((h) => (
      <div key={h.id} style={{
        padding: "10px",
        marginTop: "5px",
        background: "#1e293b",
        borderRadius: "6px"
      }}>
        {h.patient_name} → {h.action} (Bed {h.bed_number})
      </div>
    ))}
  </div>
)}
{view === "doctors" && (
  <div style={{ padding: "20px" }}>
    <h2>👨‍⚕️ Physio/Incharge</h2>

    {Object.keys(doctorStats).map((doc) => (
  <div
    key={doc}
    style={{
      marginTop: "10px",
      padding: "15px",
      background: "#1e293b",
      borderRadius: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <span
      onClick={() => {
        setDoctorFilter(doc)
        setView("patients")
      }}
      style={{ cursor: "pointer", color: "#22c55e" }}
    >
      {doc}
    </span>

    <div style={{ display: "flex", gap: "10px" }}>
      <span>{doctorStats[doc]} patients</span>

      <button
        onClick={async () => {
          const confirmDelete = confirm(`Delete Physio/Inch ${doc}?`)
          if (!confirmDelete) return

          // ❌ Prevent delete if patients exist
          const hasPatients = activePatients.some(p => p.physio_incharge === doc)

          if (hasPatients) {
            alert("Cannot delete Physio/Inch with active patients ❌")
            return
          }

          await supabase
            .from("doctors")
            .delete()
            .eq("name", doc)

          fetchDoctors()
        }}
        style={{
          background: "#ef4444",
          border: "none",
          color: "white",
          padding: "5px 8px",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Delete
      </button>
    </div>
  </div>
))}
    
  </div>
)}
{view === "hospital" && (
  <div style={{ padding: "20px" }}>
    <h2>🏥 Shifted Out Patients</h2>

    {hospitalPatients.length === 0 ? (
      <p style={{ color: "#94a3b8" }}>
        No patients in hospital
      </p>
    ) : (
      hospitalPatients.map((p) => (
        <div
          key={p.id}
          style={{
            marginTop: "10px",
            padding: "15px",
            background: "#1e293b",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <b>{p.name}</b>
            <br />
            Bed: {p.bed_number}
            <br />
            Physio/Inch: {p.physio_incharge}
          </div>

          <button
 
  onClick={() => {
    setReturnPatient(p)
    setShowReturnModal(true)
  }}
  style={{
    background: "#22c55e",
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: "6px"
  }}


>
  Return
</button>
        </div>
      ))
    )}
  </div>
)}

{view === "admin" && role === "admin" && (
  <div style={{ padding: "20px" }}>
    <h2>🔒 Admin Panel</h2>

    <input
  placeholder="Search discharged patient..."
  value={adminSearch}
  onChange={(e) => setAdminSearch(e.target.value)}
  style={{
    marginBottom: "10px",
    padding: "8px",
    width: "100%",
    borderRadius: "6px",
    border: "none"
  }}
/>

    <table style={{
  width: "100%",
  borderCollapse: "collapse",
  background: "#020617",
  borderRadius: "10px",
  overflow: "hidden",
  marginTop: "10px"
}}>
  <thead style={{ background: "#1e293b" }}>
    <tr>
      <th style={th}>Name</th>
      <th style={th}>Age</th>
      <th style={th}>Sex</th>
      <th style={th}>Address</th>
      <th style={th}>2 Contact</th>
      <th style={th}>Physio/Inch</th>
      <th style={th}>Condition</th>
      <th style={th}>Reference</th>
      <th style={th}>Refferal</th>
      <th style={th}>Admission</th>
      <th style={th}>Discharge</th>
      <th style={th}>Bed</th>
    </tr>
  </thead>

  <tbody>
    {dischargedPatients
  .filter(p =>
    p.name?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    p.physio_incharge?.toLowerCase().includes(adminSearch.toLowerCase())
  )
  .map((p) => (
      <tr
        key={p.id}
        style={{ cursor: "pointer" }}
        onClick={() => setSelectedPatient(p)}
        onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        <td style={td}>{p.name}</td>
        <td style={td}>{p.age}</td>
        <td style={td}>{p.sex}</td>
        
        <td style={td}>{p.address}</td>
        <td style={td}>{p.to_contact}</td>
        <td style={td}>{p.physio_incharge}</td>
        <td style={{
          ...td,
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {p.condition}
        </td>
        <td style={td}>{p.referred_from}</td>
        <td style={td}>{p.referral}</td>
        <td style={td}>{p.admission_date?.slice(0,10)}</td>
        <td style={td}>{p.discharge_date?.slice(0,10)}</td>
        <td style={td}>{p.physio_incharge}</td>
        <td style={td}>{p.bed_number}</td>
      </tr>
    ))}
  </tbody>
</table>
  </div>
)}

    {selectedPatient && (
  <div style={{
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(0.9)",
  animation: "popupFade 0.25s ease forwards",

  background: "rgba(15, 23, 42, 0.9)",
  backdropFilter: "blur(10px)",
  padding: "25px",
  borderRadius: "16px",
  color: "white",
  minWidth: "320px",

  maxHeight: "80vh",     // ✅ IMPORTANT
  overflowY: "auto",     // ✅ IMPORTANT

  boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
  border: "1px solid #334155"
}}>
    <h3 style={{
  marginBottom: "15px",
  fontSize: "20px",
  fontWeight: "600",
  borderBottom: "1px solid #334155",
  paddingBottom: "8px"
}}>
  🧾 Patient Details
</h3>

<p><b style={{ color: "#f97316" }}>Name:</b> {selectedPatient.name}</p>
<p><b style={{ color: "#f97316" }}>Age:</b> {selectedPatient.age}</p>
<p><b style={{ color: "#f97316" }}>Sex:</b> {selectedPatient.sex}</p>
<p style={{
  maxWidth: "300px",
  wordBreak: "break-word"
}}>
  <b style={{ color: "#f97316" }}>Address:</b> {selectedPatient.address}
</p>
 <p><b style={{ color: "#f97316" }}>2 Contact:</b> {selectedPatient.to_contact}</p>
 <p><b style={{ color: "#f97316" }}>Physio Incharge:</b> {selectedPatient.physio_incharge}</p>
<p style={{
  
  maxWidth: "300px",
  wordBreak: "break-word"                                 
}}>

  <b style={{ color: "#f97316" }}>Condition:</b> {selectedPatient.condition}
</p>
<p><b style={{ color: "#f97316" }}>Parent Doctor:</b> {selectedPatient.parent_doctor}</p>
<p><b style={{ color: "#f97316" }}>Parent Hospital:</b> {selectedPatient.parent_hospital}</p>
<p><b style={{ color: "#f97316" }}>Reference:</b> {selectedPatient.referred_from}</p>
<p><b style={{ color: "#f97316" }}>Referral:</b> {selectedPatient.referral}</p>
<p><b style={{ color: "#f97316" }}>Admission:</b> {selectedPatient.admission_date?.slice(0,10)}</p>
<p><b style={{ color: "#f97316" }}>Discharge:</b> {selectedPatient.discharge_date?.slice(0,10) || "-"}</p>
<p><b style={{ color: "#f97316" }}>Bed:</b> {selectedPatient.bed_number}</p>


<h4 style={{ marginTop: "15px" }}>Timeline</h4>

{timeline.map((t) => (
  <div key={t.id} style={{
    padding: "8px",
    marginTop: "5px",
    background: "#020617",
    borderRadius: "6px"
  }}>
    <b>{t.type.toUpperCase()}</b>
    <br />
    {t.start_date?.slice(0,10)} → {t.end_date?.slice(0,10) || "Present"}
  </div>
))}

<p style={{ marginTop: "10px", color: "#22c55e" }}>
  Total Rehab Days: {calculateRehabDays(timeline)}
</p>
<p style={{ marginTop: "5px", color: "#f59e0b" }}>
  Total Shift Out Days: {calculateShiftDays(timeline)}
</p>

    <div style={{
  marginTop: "15px",
  position: "sticky",
  bottom: 0,
  background: "rgba(15, 23, 42, 0.95)",
  paddingTop: "10px",
  paddingBottom: "5px"
}}>

  {selectedPatient.discharge_date ? (
    <p style={{ color: "#94a3b8" }}>
      Patient already discharged
    </p>
  ) : (
    <>
      <button
  onClick={() => {
    setEditMode(true)
    setForm(selectedPatient)
  }}
  style={{
    marginRight: "10px",
    background: "#3b82f6",   // 🔵 Blue
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  Edit
</button>

<button
  onClick={async () => {
    const now = new Date().toISOString()

    await supabase
      .from("patient_stays")
      .update({ end_date: now })
      .eq("patient_id", selectedPatient.id)
      .eq("type", "rehab")
      .is("end_date", null)

    await supabase.from("patient_stays").insert([{
      patient_id: selectedPatient.id,
      type: "hospital",
      start_date: now
    }])

    await supabase
      .from("patients")
      .update({
        status: "hospital",
        bed_number: null
      })
      .eq("id", selectedPatient.id)

    await fetchPatients()

await fetchTimeline(selectedPatient.id)   // 🔥 ADD THIS



    alert("Shifted Out 🏥")
  }}
  style={{
    background: "#f59e0b",   // 🟡 Orange
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  Shift Out
</button>

      <button
        onClick={handleDischarge}
        style={{
          marginLeft: "10px",
          background: "#ef4444",
          color: "white",
          padding: "8px",
          border: "none",
          borderRadius: "5px"
        }}
      >
        Discharge
      </button>
    </>
  )}

  <button
    onClick={() => setSelectedPatient(null)}
    style={{
      marginLeft: "10px",
      background: "#64748b",
      color: "white",
      padding: "8px",
      border: "none",
      borderRadius: "5px"
    }}
  >
    Close
  </button>

</div>
    </div>
    
  
)}
{showForm && (
  <div style={{
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(0.9)",
animation: "popupFade 0.25s ease forwards",
  background: "#1e293b",
  padding: "20px",
  borderRadius: "10px",
  color: "white",
  zIndex: 999,
  minWidth: "300px"
}}>
    <h3>Add Patient</h3>

    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

  <input name="name" placeholder="Name" onChange={handleChange} />

<input
  type="date"
  name="birthdate"
  value={form.birthdate || ""}
  onChange={handleChange}
  max={new Date().toISOString().split("T")[0]} // prevent future date
  style={{
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white"
  }}
/>

<select
  name="sex"
  value={form.sex || ""}
  onChange={handleChange}
  style={{
    padding: "10px",
    borderRadius: "6px",
    background: "#020617",
    color: "white",
    border: "1px solid #334155"
  }}
>
  <option value="">Select Sex</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
</select>

<input name="address" placeholder="Address" onChange={handleChange} />

<input name="to_contact" placeholder="2 Contact" onChange={handleChange} />

<input name="condition" placeholder="Condition" onChange={handleChange} />

<input name="parent_doctor" placeholder="Parent Doctor" onChange={handleChange} />

<input name="parent_hospital" placeholder="Parent Hospital" onChange={handleChange} />

<input name="referred_from" placeholder="referred_from" onChange={handleChange} />

<input name="referral" placeholder="Referral " onChange={handleChange} />

  <input
    placeholder="New Physio/Inch"
    value={newDoctor}
    onChange={(e) => setNewDoctor(e.target.value)}
  />

  <button onClick={handleAddDoctor}>
    Add Doctor
  </button>

  <select
  name="physio_incharge"
  value={form.physio_incharge || ""}
  onChange={handleChange}
  style={{
    padding: "10px",
    borderRadius: "6px",
    background: "#020617",
    color: "white",
    border: "1px solid #334155"
  }}
>
  <option value="">Select Physio/Inch</option>

  {doctors.map((doc) => (
    <option key={doc.id} value={doc.name}>
      {doc.name}
    </option>
  ))}
</select>

  <select
  name="bed_number"
  value={form.bed_number || ""}
  onChange={handleChange}
  style={{
    padding: "10px",
    borderRadius: "6px",
    background: "#020617",
    color: "white",
    border: "1px solid #334155"
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

    <button
  onClick={handleSubmit}
  disabled={loading}
  style={{
    background: loading ? "#64748b" : "#22c55e",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    color: "white",
    transition: "0.2s"
  }}
>
  {loading ? "Saving..." : "Save"}
</button>
    <button onClick={() => setShowForm(false)}>Close</button>
  </div>
)}
{editMode && (
  <div style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    color: "white"
  }}>
    <h3>Edit Patient</h3>

    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}
name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" />

  <input
  type="date"
  name="birthdate"
  value={form.birthdate || ""}
  onChange={handleChange}
  max={new Date().toISOString().split("T")[0]} // prevent future date
  style={{
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white"
  }}
/>

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="sex" value={form.sex || ""} onChange={handleChange} placeholder="Sex" />

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="condition" value={form.condition || ""} onChange={handleChange} placeholder="Condition" />

<input
  style={{
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white"
  }}
  name="parent_doctor"
  value={form.parent_doctor || ""}
  onChange={handleChange}
  placeholder="Parent Doctor"
/>

<input
  style={{
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white"
  }}
  name="parent_hospital"
  value={form.parent_hospital || ""}
  onChange={handleChange}
  placeholder="Parent Hospital"
/>

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="address" value={form.address || ""} onChange={handleChange} placeholder="Address" />

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="to_contact" value={form.to_contact || ""} onChange={handleChange} placeholder="2 Contact" />

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="referred_from" value={form.referred_from || ""} onChange={handleChange} placeholder="referred_from" />

<input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="referral" value={form.referral || ""} onChange={handleChange} placeholder="Referral" />

  {/* Doctor Dropdown */}
  <select
    name="Physio/Inch"
    value={form.physio_incharge || ""}
    onChange={handleChange}
    style={{
      padding: "10px",
      borderRadius: "6px",
      background: "#020617",
      color: "white",
      border: "1px solid #334155"
    }}
  >
    <option value="">Select Doctor</option>
    {doctors.map((doc) => (
      <option key={doc.id} value={doc.name}>
        {doc.name}
      </option>
    ))}
  </select>

  {/* Bed */}
  <select
  name="bed_number"
  value={form.bed_number || ""}
  onChange={handleChange}
  style={{
    padding: "10px",
    borderRadius: "6px",
    background: "#020617",
    color: "white",
    border: "1px solid #334155"
  }}
>
  <option value="">Select Bed</option>

  {availableBeds.map((bed) => (
    <option key={bed} value={bed}>
      Bed {bed}
    </option>
  ))}

  {/* ✅ include current bed (important) */}
  {form.bed && !availableBeds.includes(form.bed) && (
    <option value={form.bed_number}>
      Bed {form.bed_number} (current)
    </option>
  )}
</select>

</div>

    <button
      onClick={async () => {
  const bedNumber = form.bed_number

  if (!bedNumber) {
    alert("Invalid bed number")
    return
  }

  // 🔴 Check if another patient already has this bed
  const { data: existing } = await supabase
    .from("patients")
    .select("*")
    .eq("bed_number", bedNumber)

  const conflict = existing.find(p => p.id !== selectedPatient.id)

  if (conflict) {
    alert("This bed is already occupied")
    return
  }

  // ✅ Safe to update
  const { error } = await supabase
    .from("patients")
    .update({
  ...form,
  age: calculateAge(form.birthdate),
  bed_number: bedNumber
})
    .eq("id", selectedPatient.id)

  if (error) {
    alert("Error updating")
  } else {
    alert("Updated ✅")
    setEditMode(false)
    setSelectedPatient(null)
    fetchPatients()
  }
}}
    >
      Save Changes
    </button>

    <button onClick={() => setEditMode(false)}>Cancel</button>
  </div>
)}
{showReturnModal && (
  <div style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    color: "white",
    minWidth: "300px",
    zIndex: 1000
  }}>
    <h3>Select Bed</h3>

    <select
      value={selectedBed}
      onChange={(e) => setSelectedBed(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        background: "#020617",
        color: "white",
        marginTop: "10px"
      }}
    >
      <option value="">Select Bed</option>

      {availableBeds.map((bed) => (
        <option key={bed} value={bed}>
          Bed {bed}
        </option>
      ))}
    </select>

    <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
      <button
        onClick={async () => {
          if (!selectedBed) {
            alert("Please select a bed ❌")
            return
          }

          const now = new Date().toISOString()

          // close hospital stay
          await supabase
            .from("patient_stays")
            .update({ end_date: now })
            .eq("patient_id", returnPatient.id)
            .eq("type", "hospital")
            .is("end_date", null)

          // start rehab stay
          const { error: returnError } = await supabase
  .from("patient_stays")
  .insert([{
    patient_id: returnPatient.id,
    type: "rehab",
    start_date: now
  }])

if (returnError) {
  console.log("❌ Return error:", returnError)
}

          // assign bed
          await supabase
            .from("patients")
            .update({
              status: "occupied",
              bed_number: selectedBed
            })
            .eq("id", returnPatient.id)

          await fetchPatients()

await fetchTimeline(returnPatient.id)   // 🔥 ADD THIS

// reset
setShowReturnModal(false)
setSelectedBed("")
setReturnPatient(null)

          alert("Returned to rehab 🏥")
        }}
        style={{
          background: "#22c55e",
          padding: "8px",
          border: "none",
          borderRadius: "6px",
          color: "white"
        }}
      >
        Confirm
      </button>

      <button
        onClick={() => {
          setShowReturnModal(false)
          setSelectedBed("")
          setReturnPatient(null)
        }}
        style={{
          background: "#64748b",
          padding: "8px",
          border: "none",
          borderRadius: "6px",
          color: "white"
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
  </div>   
</div>
)
}

