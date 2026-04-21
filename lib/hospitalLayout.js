export const hospitalLayout = {
  ground: [
    {
      block: "B1",
      zones: [
        {
          title: "ZONE A",
          beds: [A1,A2,A3,A4,A5,A6,A7,A8],
          columns: 3
        },
        {
          title: "ZONE B",
          beds: [B1,B2,B3,B4,B5,B6],
          columns: 3
        },
        {
          title: "ZONE C (TRIPLE-1)",
          beds: [15,16,17],
          columns: 3
        }
      ]
    },
    {
      block: "B2",
      zones: [
        {
          title: "HDU",
          beds: [18,19,20,21,22,23,24],
          columns: 3
        },
        {
          title: "ZONE C",
          beds: [25,26,27,28,29,30],
          columns: 3
        },
        {
          title: "SINGLE 1",
          beds: [31],
          columns: 1
        }
      ]
    },
    {
      block: "B3",
      zones: [
        {
          title: "ZONE D",
          beds: [32,33,34],
          columns: 3
        }
      ]
    },
    {
      block: "B4",
      zones: [
        {
          title: "ZONE E",
          beds: [35,36,37,38,39],
          columns: 3
        },
        {
          title: "SINGLE 3",
          beds: [40],
          columns: 1
        }
      ]
    }
  ],

  first: [
    {
      block: "ZONE",
      zones: [
        { title: "TWIN 1", beds: [41,42], columns: 2 },
        { title: "TWIN 2", beds: [43,44], columns: 2 },
        { title: "DELUX", beds: [45], columns: 1 },
        { title: "SINGLE 2", beds: [46], columns: 1 },
        { title: "TWIN 3", beds: [47,48], columns: 2 },
        { title: "TRIPLE 2", beds: [49,50,51], columns: 3 }
      ]
    },
    {
      block: "ZONE F",
      zones: [
        {
          title: "ZONE F",
          beds: [52,53,54,55,56,57,58,59,60],
          columns: 3
        }
      ]
    }
  ]
}