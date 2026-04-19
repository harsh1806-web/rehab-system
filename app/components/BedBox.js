export default function BedBox({ bed, patient, onClick }) {
  const bg =
    patient?.status === "hold"
      ? "black"
      : patient
      ? "#ef4444"
      : "#22c55e"

  return (
    <div
      onClick={onClick}
      style={{
        width: "45px",
        height: "45px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: "white",
        borderRadius: "4px",
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      {bed}
    </div>
  )
}