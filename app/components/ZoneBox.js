export default function ZoneBox({ title, beds, activePatients, onBedClick }) {
  return (
    <div style={{
      background: "#020617",
      border: "2px solid #22d3ee",
      borderRadius: "10px",
      padding: "10px",
      marginBottom: "15px"
    }}>
      {/* Zone Title */}
      <div style={{
        background: "#facc15",
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
        padding: "5px",
        marginBottom: "10px"
      }}>
        {title}
      </div>

      {/* Beds */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "6px"
      }}>
        {(beds || []).map((bed) => {
         const patient = (activePatients || []).find(
  (p) => Number(p.bed_number) === bed
)

          return (
            <div
              key={bed}
              onClick={() => onBedClick(bed, patient)}
              style={{
                height: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "5px",
                cursor: "pointer",
                background:
                  patient?.status === "hold"
                    ? "#000000"
                    : patient
                    ? "#ef4444"
                    : "#22c55e",
                color: "white",
                fontWeight: "bold"
              }}
            >
              {bed}
            </div>
          )
        })}
      </div>
    </div>
  )
}