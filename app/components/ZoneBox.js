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
      borderRadius: "10px",
      padding: "10px",
      minWidth: "140px"
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
        gap: "6px"
      }}>
        {beds.map((bed) => {
          const patient = activePatients.find(
            p => Number(p.bed_number) === bed
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
                fontWeight: "bold",
                background:
                  patient?.status === "hold"
                    ? "#000000"
                    : patient
                    ? "#ef4444"
                    : "#22c55e"
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