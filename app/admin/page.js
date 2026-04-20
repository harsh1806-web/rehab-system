"use client"
import { hospitalLayout } from "@/lib/hospitalLayout"
import { ZoneBox } from "@/components/ZoneBox"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Admin() {
  const router = useRouter()

useEffect(() => {
  checkAccess()
  fetchUserRole()
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
    const activePatients = patients.filter(p => !p.discharge_date)
    const dischargedPatients = patients.filter(p => p.discharge_date !== null)
    const doctorStats = {}

activePatients.forEach((p) => {
  if (!doctorStats[p.doctor]) {
    doctorStats[p.doctor] = 0
  }
  doctorStats[p.doctor]++
})
    
  const [loading, setLoading] = useState(false)
const [showForm, setShowForm] = useState(false)

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
const fetchHistory = async () => {
  const { data } = await supabase
    .from("patient_history")
    .select("*")
    .order("created_at", { ascending: false })

  setHistory(data)
}

  const handleSubmit = async () => {
    if (!form.doctor) {
  alert("Please select a doctor")
  return
}
  if (loading) return   // ⛔ prevent double click

  setLoading(true)

  const { error } = await supabase.from("patients").insert([{
  ...form,
  status: "occupied",
  bed_number: Number(form.bed_number),
  admission_date: form.admission_date || new Date().toISOString()
}])

  if (error) {
    alert(error.message)
    console.log(error)
  } else {
    alert("Patient added ✅")
      await supabase.from("patient_history").insert([{
  patient_name: form.name,
  action: "admitted",
  bed_number: Number(form.bed_number),
  doctor: form.doctor
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
  discharge_date: new Date().toISOString()
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
  doctor: selectedPatient.doctor
}])
  }
}
const th = {
  padding: "12px",
  textAlign: "left",
  background: "#1e293b",
  color: "#cbd5f5"
}

const td = {
  padding: "12px",
  borderTop: "1px solid #1e293b",
  color: "#e2e8f0"
}

const handleAddDoctor = async () => {
  if (!newDoctor) return alert("Enter doctor name")

  const { error } = await supabase
    .from("doctors")
    .insert([{ name: newDoctor }])

  if (error) {
    console.log(error)
  } else {
    setNewDoctor("")
    fetchDoctors()
  }
}
if (role === "user" && view === "admin") {
  return (
    <div style={{ color: "white", padding: "50px" }}>
      ❌ Access Denied
    </div>
  )
}

 return (
  <div style={{
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    fontFamily: "sans-serif"
  }}>
   

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
        Doctors
      </button>
      <button
  onClick={() => setView("discharged")}
  style={{
    background: view === "discharged" ? "#22c55e" : "#334155",
    padding: "8px 16px",
    borderRadius: "6px",
    color: "white",
    border: "none",
    cursor: "pointer"
  }}
>
  Discharged
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
    </div>
  </div>
  <div style={{
  padding: "20px",
  maxWidth: "1200px",
  margin: "0 auto"
}}>
    
    

    {/* LEFT SECTION */}
    {view === "beds" && (
  <div style={{ marginTop: "20px" }}>

    {/* LEGEND */}
    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      <span>🟩 Empty</span>
      <span>🟥 Occupied</span>
      <span>⬛ Hold</span>
    </div>

    {/* ================= GROUND FLOOR ================= */}
    <h2 style={{ color: "#22c55e" }}>Ground Floor</h2>

    <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
      {hospitalLayout.ground.map((zone) => (
        <ZoneBox
          key={zone.title}
          title={zone.title}
          beds={zone.beds}
          patients={activePatients}
          onClick={(bed, patient) => {
            if (patient) {
              setSelectedPatient(patient)
            } else {
              setShowForm(true)
              setForm({ ...form, bed_number: bed })
            }
          }}
        />
      ))}
    </div>

    {/* ================= FIRST FLOOR ================= */}
    <h2 style={{ color: "#f97316", marginTop: "30px" }}>1st Floor</h2>

    <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
      {hospitalLayout.first.map((zone) => (
        <ZoneBox
          key={zone.title}
          title={zone.title}
          beds={zone.beds}
          patients={activePatients}
          onClick={(bed, patient) => {
            if (patient) {
              setSelectedPatient(patient)
            } else {
              setShowForm(true)
              setForm({ ...form, bed_number: bed })
            }
          }}
        />
      ))}
    </div>

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
  <option value="">All Doctors</option>

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

     <table style={{
  width: "100%",
  borderCollapse: "collapse",
  background: "#020617",
  borderRadius: "10px",
  overflow: "hidden"
}}>
  <thead style={{ background: "#1e293b" }}>
    <tr>
      <th style={th}>Name</th>
<th style={th}>Age</th>
<th style={th}>Sex</th>
<th style={th}>Condition</th>
<th style={th}>Address</th>
<th style={th}>Contact</th>
<th style={th}>Reference</th>
<th style={th}>Admission</th>
<th style={th}>Discharge</th>
<th style={th}>Doctor</th>
<th style={th}>Bed</th>
    </tr>
  </thead>

  <tbody>
    {activePatients
  .filter(p =>
  p.name?.toLowerCase().includes(search.toLowerCase()) &&
  (doctorFilter ? p.doctor === doctorFilter : true)
)
  .map((p) => (
      <tr
  key={p.id}
  style={{ cursor: "pointer" }}
  onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
>
        <td style={td}>{p.name}</td>
<td style={td}>{p.age}</td>
<td style={td}>{p.sex}</td>
<td style={td}>{p.condition}</td>
<td style={td}>{p.address}</td>
<td style={td}>{p.contact}</td>
<td style={td}>{p.reference}</td>
<td style={td}>{p.admission_date?.slice(0,10)}</td>
<td style={td}>{p.discharge_date?.slice(0,10) || "-"}</td>
<td style={td}>{p.doctor}</td>
<td style={td}>{p.bed_number}</td>
      </tr>
    ))}
  </tbody>
</table>
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
    <h2>👨‍⚕️ Doctors</h2>

    {Object.keys(doctorStats).length === 0 ? (
      <p style={{ color: "#94a3b8" }}>No doctors yet</p>
    ) : (
      Object.keys(doctorStats).map((doc) => (
        <div
          key={doc}
          style={{
            marginTop: "10px",
            padding: "15px",
            background: "#1e293b",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between"
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
          <span>{doctorStats[doc]} patients</span>
        </div>
      ))
    )}
  </div>
)}
{view === "discharged" && (
  <div style={{ marginTop: "20px" }}>
    <h2>Discharged Patients</h2>

    {dischargedPatients.length === 0 ? (
      <div style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px"
      }}>
        <p style={{ color: "#94a3b8" }}>
          No discharged patients yet
        </p>
      </div>
    ) : (
      dischargedPatients.map((p) => (
  <div
    key={p.id}
    onClick={() => setSelectedPatient(p)}   // ✅ THIS LINE ADDED
    style={{
      marginTop: "10px",
      padding: "15px",
      background: "#1e293b",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "0.2s"
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = "#334155"}
    onMouseLeave={(e) => e.currentTarget.style.background = "#1e293b"}
  >
          <b>{p.name}</b>  
          <br />
          Bed: {p.bed_number}  
          <br />
          Doctor: {p.doctor}  
          <br />
          Discharged on: {p.discharge_date?.slice(0,10)}
        </div>
      ))
    )}
  </div>
)}
{view === "admin" && role === "admin" && (
  <div style={{ padding: "20px" }}>
    <h2>🔒 Admin Panel</h2>

    {dischargedPatients.map((p) => (
      <div key={p.id} style={{
        marginTop: "10px",
        padding: "10px",
        background: "#1e293b",
        borderRadius: "6px"
      }}>
        {p.name} (Bed {p.bed_number})

        <button
          onClick={() => {
            setSelectedPatient(p)
            setEditMode(true)
            setForm(p)
          }}
          style={{ marginLeft: "10px" }}
        >
          Edit
        </button>
      </div>
    ))}
  </div>
)}

    {selectedPatient && (
  <div style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    color: "white",
    minWidth: "250px"
  }}>
    <h3>Patient Details</h3>

    <p><b>Name:</b> {selectedPatient.name}</p>
<p><b>Age:</b> {selectedPatient.age}</p>
<p><b>Sex:</b> {selectedPatient.sex}</p>
<p><b>Condition:</b> {selectedPatient.condition}</p>
<p><b>Address:</b> {selectedPatient.address}</p>
<p><b>Contact:</b> {selectedPatient.contact}</p>
<p><b>Reference:</b> {selectedPatient.reference}</p>
<p><b>Doctor:</b> {selectedPatient.doctor}</p>
<p><b>Bed:</b> {selectedPatient.bed_number}</p>
<p><b>Admission:</b> {selectedPatient.admission_date?.slice(0,10)}</p>
<p><b>Discharge:</b> {selectedPatient.discharge_date?.slice(0,10) || "-"}</p>

    <div style={{ marginTop: "15px" }}>
      <button
  onClick={() => {
    setEditMode(true)
    setForm(selectedPatient)
  }}
  style={{ marginRight: "10px" }}
>
  Edit
</button>

      <button
        onClick={handleDischarge}
        style={{
          marginLeft: "10px",
          background: "#ef4444",
          color: "white",
          padding: "8px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Discharge
      </button>
    </div>
    
  </div>
)}
{showForm && (
  <div style={{
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#1e293b",
  padding: "20px",
  borderRadius: "10px",
  color: "white",
  zIndex: 1000,
  minWidth: "300px"
}}>
    <h3>Add Patient</h3>

    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

  <input name="name" placeholder="Name" onChange={handleChange} />

<input name="age" placeholder="Age" onChange={handleChange} />

<input name="sex" placeholder="Sex" onChange={handleChange} />

<input name="condition" placeholder="Condition" onChange={handleChange} />

<input name="address" placeholder="Address" onChange={handleChange} />

<input name="contact" placeholder="Contact Number" onChange={handleChange} />

<input name="reference" placeholder="Reference (Who referred?)" onChange={handleChange} />

<input
  type="date"
  name="admission_date"
  onChange={handleChange}
/>

  <input
    placeholder="New Doctor"
    value={newDoctor}
    onChange={(e) => setNewDoctor(e.target.value)}
  />

  <button onClick={handleAddDoctor}>
    Add Doctor
  </button>

  <select
  name="doctor"
  value={form.doctor || ""}
  onChange={handleChange}
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    background: "#020617",
    color: "white",
    border: "1px solid #334155"
  }}
>
    <option value="">Select Doctor</option>
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

  <input
    name="bed_number"
    value={form.bed_number}
    readOnly
    style={{ background: "#334155", color: "#94a3b8" }}
  />

</div>

    <button
  onClick={handleSubmit}
  disabled={loading}
  style={{
    background: loading ? "#64748b" : "#22c55e",
    cursor: loading ? "not-allowed" : "pointer",
    marginRight: "10px"
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

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="age" value={form.age || ""} onChange={handleChange} placeholder="Age" />

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
}}name="contact" value={form.contact || ""} onChange={handleChange} placeholder="Contact" />

  <input style={{
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}}name="reference" value={form.reference || ""} onChange={handleChange} placeholder="Reference" />

  {/* Doctor Dropdown */}
  <select
    name="doctor"
    value={form.doctor || ""}
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
  <input
    name="bed_number"
    value={form.bed_number || ""}
    onChange={handleChange}
    placeholder="Bed Number"
  />

</div>

    <button
      onClick={async () => {
  const bedNumber = parseInt(form.bed_number)

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
    .update({ ...form, bed_number: bedNumber })
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
  </div>   
</div>
)
}