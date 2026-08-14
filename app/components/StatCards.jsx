"use client"

export default function StatCards({ totalBeds = 0, occupied = 0, available = 0, hospital = 0 }) {
  const occupancyPercent = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0

  const cards = [
    { label: "Total Beds", value: totalBeds, color: "#38bdf8", icon: "🛏️", bg: "rgba(56, 189, 248, 0.08)" },
    { label: "Occupied", value: occupied, color: "#22c55e", icon: "🟢", bg: "rgba(34, 197, 94, 0.08)" },
    { label: "Available", value: available, color: "#f8fafc", icon: "⚪", bg: "rgba(248, 250, 252, 0.05)" },
    { label: "Shifted Out", value: hospital, color: "#f59e0b", icon: "🏥", bg: "rgba(245, 158, 11, 0.08)" }
  ]

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "16px"
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              background: card.bg,
              border: "1px solid #1e293b",
              padding: "18px 20px",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>
                {card.label}
              </p>
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: card.color }}>
                {card.value}
              </h2>
            </div>
            <div style={{ fontSize: "24px", opacity: 0.85 }}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Capacity & Occupancy Progress Bar */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          padding: "12px 18px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "160px" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Occupancy Rate:</span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: occupancyPercent > 90 ? "#ef4444" : occupancyPercent > 75 ? "#f59e0b" : "#22c55e"
            }}
          >
            {occupancyPercent}% ({occupied}/{totalBeds})
          </span>
        </div>

        <div
          style={{
            flex: 1,
            height: "8px",
            background: "#1e293b",
            borderRadius: "999px",
            overflow: "hidden",
            minWidth: "140px"
          }}
        >
          <div
            style={{
              width: `${Math.min(100, occupancyPercent)}%`,
              height: "100%",
              background: occupancyPercent > 90 ? "#ef4444" : occupancyPercent > 75 ? "#f59e0b" : "#22c55e",
              borderRadius: "999px",
              transition: "width 0.4s ease"
            }}
          />
        </div>
      </div>
    </div>
  )
}
