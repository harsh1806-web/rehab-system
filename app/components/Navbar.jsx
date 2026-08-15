"use client"

export default function Navbar({
  currentView,
  onSelectView,
  role = "admin", // "admin" | "administrator" | "receptionist" | "doctor"
  onLogout,
  occupancyCount = 0,
  totalBeds = 72,
  shiftedCount = 0
}) {
  const isDoctor = role === "doctor"
  const isReceptionist = role === "receptionist"

  const roleConfig = {
    admin: { label: "ADMIN", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", icon: "👑" },
    administrator: { label: "ADMINISTRATOR (VIEW ONLY)", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.15)", icon: "🛡️" },
    receptionist: { label: "RECEPTIONIST", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", icon: "💼" },
    doctor: { label: "DOCTOR", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", icon: "🩺" },
    user: { label: "RECEPTIONIST", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", icon: "💼" }
  }

  const currentRole = roleConfig[role] || roleConfig.admin

  const navItems = [
    { id: "beds", label: "Bed Map", icon: "🛏️" },
    { id: "patients", label: `Active Patients (${occupancyCount})`, icon: "👥" },
    { id: "hospital", label: `Shifted Out (${shiftedCount})`, icon: "🏥" },
    { id: "doctors", label: "Physio / Incharges", icon: "🩺" },
    // Discharged and History are HIDDEN for Receptionist and Doctor
    ...(!isReceptionist && !isDoctor
      ? [
          { id: "discharged", label: "Discharged Archive", icon: "🚪" },
          { id: "history", label: "Audit Log", icon: "📜" }
        ]
      : [])
  ]

  return (
    <header
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1e293b",
        position: "sticky",
        top: 0,
        zIndex: 900,
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      {/* Brand & Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 0 15px rgba(34, 197, 94, 0.35)"
            }}
          >
            🏥
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.3px" }}>
              Rehab Hospital System
            </h1>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Bed & Inpatient Patient Management</span>
          </div>
        </div>

        {/* Role Badge */}
        <div
          style={{
            background: currentRole.bg,
            border: `1px solid ${currentRole.color}55`,
            color: currentRole.color,
            padding: "4px 10px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <span>{currentRole.icon}</span>
          <span>{currentRole.label}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              style={{
                background: isActive ? "#22c55e" : "#1e293b",
                color: isActive ? "#020617" : "#cbd5e1",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                boxShadow: isActive ? "0 0 15px rgba(34, 197, 94, 0.4)" : "none"
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            background: "#080e1e",
            border: "1px solid #1e293b",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#94a3b8"
          }}
        >
          Occupancy:{" "}
          <b style={{ color: "#22c55e" }}>
            {occupancyCount}/{totalBeds}
          </b>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </header>
  )
}
