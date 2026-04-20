export default function ZoneBox({
  title,
  beds,
  columns = 3,
  activePatients,
  onBedClick
}) {
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
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "6px",
        justifyItems: "center"
      }}>
        {beds.map((bed) => {
          const patient = activePatients.find(
            p => Number(p.bed_number) === bed
          )

          let bg = "#22c55e" // empty

          if (patient) {
            bg = "#ef4444" // occupied
          }

          return (
            <button
              key={bed}
              onClick={() => onBedClick(bed, patient)}
              style={{
                width: "60px",
                height: "50px",
                borderRadius: "8px",
                background: bg,
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
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