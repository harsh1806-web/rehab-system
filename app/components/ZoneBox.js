
export default function ZoneBox({
  title,
  beds,
  columns = 3,
  activePatients,
  heldBeds,          // ✅ ADD
  onHoldToggle,      // ✅ ADD
  onBedClick
})
 {
  return (
    <div style={{
      background: "#020617",
      border: "2px solid #22d3ee",
      boxShadow: "0 0 10px rgba(34,211,238,0.3)",
      borderRadius: "10px",
      padding: "10px",
      minWidth: "160px",
      flex: "0 0 auto"   // 🔥 THIS FIXES ALIGNMENT
    }}>

      {/* TITLE */}
      <div style={{
        background: "#facc15",
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
        padding: "5px",
        marginBottom: "8px"
      }}>
        {title}
      </div>

      {/* BEDS */}
      <div style={{
        display: "grid",  
alignItems: "center",
justifyContent: "center",
fontSize: "11px",
whiteSpace: "normal",
wordBreak: "break-word",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "6px",
        justifyItems: "center"
      }}>
        {beds.map((bed) => {
          const patient = activePatients.find(
  p =>
    p.bed_number?.toString().trim().toUpperCase() ===
    bed.toString().trim().toUpperCase()
)

          let bg = "#ffffff"   // ⚪ empty
let textColor = "black"

if (heldBeds?.includes(bed)) {
  bg = "#f97316"     // 🟠 held (orange)
  textColor = "white"
} else if (patient) {
  bg = "#22c55e"     // 🟢 occupied
  textColor = "white"
}

          return (
            <button
              key={bed}
              onClick={() => {
  // 🟠 If bed is held → ask to unhold
  if (heldBeds?.includes(bed)) {
    const confirmUnhold = confirm(`Unhold bed ${bed}?`)
    if (confirmUnhold) {
      onHoldToggle(bed)
    }
    return
  }

  // 🟢 normal flow
  onBedClick(bed, patient)
}}
              style={{
  width: "60px",
  height: "50px",
  borderRadius: "8px",
  background: bg,
  color: textColor, 
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
  transform: "scale(1)"
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "scale(1.1)"
  e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.4)"
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "scale(1)"
  e.currentTarget.style.boxShadow = "none"
}}
              onMouseEnter={(e) => {
  e.currentTarget.style.transform = "scale(1.1)"
  e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.4)"
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "scale(1)"
  e.currentTarget.style.boxShadow = "none"
}}
            >
              {bed}
            </button>
          )
        })}
      </div>
    </div>
  )
}

