"use client"

export default function ZoneBox({
  title,
  beds = [],
  columns = 3,
  activePatients = [],
  heldBeds = [],
  onHoldToggle,
  onBedClick,
  highlightedPatients = {}
}) {
  return (
    <div
      style={{
        background: "#0b132b",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        borderRadius: "12px",
        padding: "12px",
        minWidth: "170px",
        flex: "0 0 auto",
        transition: "all 0.2s ease"
      }}
    >
      {/* Zone Title Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #facc15, #eab308)",
          color: "#0f172a",
          fontWeight: "800",
          textAlign: "center",
          padding: "6px 10px",
          borderRadius: "6px",
          marginBottom: "10px",
          fontSize: "13px",
          letterSpacing: "0.5px"
        }}
      >
        {title}
      </div>

      {/* Bed Tiles Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(48px, 1fr))`,
          gap: "8px",
          justifyItems: "center"
        }}
      >
        {beds.map((bed) => {
          const patient = activePatients.find(
            (p) =>
              p.bed_number?.toString().trim().toUpperCase() ===
              bed.toString().trim().toUpperCase()
          )

          const isHeld = heldBeds?.includes(bed)
          const customColor = patient ? highlightedPatients[patient.id] : null

          let bg = "#ffffff"
          let textColor = "#0f172a"
          let border = "1px solid #cbd5e1"
          let tooltip = `Bed ${bed}: Empty`

          if (isHeld) {
            bg = "#f97316"
            textColor = "#ffffff"
            border = "1px solid #ea580c"
            tooltip = `Bed ${bed}: Reserved / Held`
          } else if (patient) {
            bg = customColor || "#22c55e"
            textColor = customColor ? "#000000" : "#ffffff"
            border = "1px solid rgba(255,255,255,0.2)"
            tooltip = `Bed ${bed}: ${patient.name} (${patient.physio_incharge || "No Physio"})`
          }

          return (
            <button
              key={bed}
              title={tooltip}
              onClick={() => {
                if (isHeld && !patient) {
                  if (onHoldToggle) onHoldToggle(bed)
                  return
                }
                onBedClick(bed, patient)
              }}
              style={{
                width: "56px",
                height: "48px",
                borderRadius: "8px",
                background: bg,
                color: textColor,
                border: border,
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <span>{bed}</span>
              {patient && (
                <span
                  style={{
                    fontSize: "9px",
                    maxWidth: "50px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    opacity: 0.9,
                    fontWeight: "500"
                  }}
                >
                  {patient.name.split(" ")[0]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
