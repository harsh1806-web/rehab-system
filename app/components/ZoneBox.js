import BedBox from "./BedBox"

export default function ZoneBox({ title, beds, patients, onClick }) {
  return (
    <div style={{
      border: "3px solid cyan",
      padding: "10px",
      marginRight: "15px"
    }}>
      
      {/* HEADER */}
      <div style={{
        background: "#facc15",
        color: "black",
        padding: "5px",
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: "5px"
      }}>
        {title}
      </div>

      {/* BEDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 45px)",
        gap: "5px"
      }}>
        {beds.map((bed) => {
          const patient = patients.find(p => Number(p.bed_number) === bed)

          return (
            <BedBox
              key={bed}
              bed={bed}
              patient={patient}
              onClick={() => onClick(bed, patient)}
            />
          )
        })}
      </div>

    </div>
  )
}