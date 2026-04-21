export const hospitalLayout = {
  ground: [
    // ===== B1 =====
    {
      block: "B1",
      zones: [
        { title: "Zone A", beds: ["A1","A2","A3","A4","A5","A6","A7","A8","A9"], columns: 3 },
        { title: "Zone B", beds: ["B1","B2","B3","B4","B5","B6"], columns: 3 },
        { title: "Zone C (Triple 1)", beds: ["C1","C2","C3"], columns: 3 },
      ]
    },

    // ===== B2 =====
    {
      block: "B2",
      zones: [
        { title: "Zone HDU", beds: ["HDU1","HDU2","HDU3","HDU4","HDU5","HDU6","HDU7"], columns: 3 },
        { title: "Zone D", beds: ["D1","D2","D3","D4","D5","D6"], columns: 3 },
        { title: "Zone E(Single)", beds: ["E1"], columns: 3 },
      ]
    },

    // ===== B3 =====
    {
      block: "B3",
      zones: [
        { title: "Zone G", beds: ["G1","G2","G3"], columns: 3 },
      ]
    },

    // ===== B4 =====
    {
      block: "B4",
      zones: [
        { title: "Zone I", beds: ["I1","I2","I3","I4","I5"], columns: 3 },
        { title: "Single-2", beds: ["SINGLE1"], columns: 3 },
      ]
    },
  ],

  first: [
    // ===== B2 FIRST FLOOR =====
    {
      block: "B2",
      zones: [
        { title: "Zone F - Twin 1", beds: ["TWIN1","TWIN2"], columns: 2 },
        { title: "Zone F - Twin 2", beds: ["TWIN1","TWIN2"], columns: 2 },
        { title: "Delux", beds: ["DELUX1"], columns: 1 },
        { title: "Single", beds: ["SINGLE1"], columns: 1 },
        { title: "Zone F - Twin 3", beds: ["TWIN1","TWIN2"], columns: 2 },
        { title: "Triple", beds: ["TRIPLE1","TRIPLE2","TRIPLE3"], columns: 3 },
      ]
    },

    // ===== B3 FIRST FLOOR =====
    {
      block: "B3",
      zones: [
        { title: "Zone H", beds: ["H1","H2","H3","H4","H5","H6","H7","H8","H9","H10"], columns: 3 },
      ]
    },
  ]
}