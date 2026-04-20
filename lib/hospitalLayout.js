export const hospitalLayout = {
  ground: [
    {
      block: "B1",
      zones: [
        { title: "ZONE A", beds: [1,2,3,4,5,6,7,8], columns: 3 },
        { title: "ZONE B", beds: [9,10,11,12,13,14], columns: 3 }
      ]
    },
    {
      block: "B2",
      zones: [
        { title: "HDU", beds: [15,16,17,18,19,20,21], columns: 3 },
        { title: "ZONE C", beds: [22,23,24], columns: 3 }
      ]
    },
    {
      block: "B3",
      zones: [
        { title: "ZONE D", beds: [25,26,27], columns: 3 }
      ]
    },
    {
      block: "B4",
      zones: [
        { title: "ZONE E", beds: [28,29,30,31,32], columns: 3 }
      ]
    },
    {
      block: "SPECIAL",
      zones: [
        { title: "SINGLE 3", beds: [33], columns: 1 },
        { title: "TRIPLE 1", beds: [34,35], columns: 2 }
      ]
    }
  ],

  first: [
    {
      block: "F1",
      zones: [
        { title: "TWIN 1", beds: [36,37], columns: 2 },
        { title: "TWIN 2", beds: [38,39], columns: 2 },
        { title: "DELUX", beds: [40], columns: 1 }
      ]
    },
    {
      block: "F2",
      zones: [
        { title: "SINGLE 2", beds: [41], columns: 1 },
        { title: "TWIN 3", beds: [42,43], columns: 2 },
        { title: "TRIPLE 2", beds: [44,45,46], columns: 3 }
      ]
    },
    {
      block: "F3",
      zones: [
        { title: "ZONE F", beds: [47,48,49,50,51,52,53,54,55], columns: 3 }
      ]
    }
  ]
}