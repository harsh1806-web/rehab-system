"use client"

import { useState } from "react"
import ZoneBox from "./ZoneBox"
import { hospitalLayout } from "@/lib/hospitalLayout"

export default function BedGrid({
  activePatients = [],
  heldBeds = [],
  onHoldToggle,
  onBedClick,
  highlightedPatients = {}
}) {
  const [blockFilter, setBlockFilter] = useState("ALL")
  const [bedSearch, setBedSearch] = useState("")

  // Combine ground and first floors by block
  const combinedLayout = {}
  hospitalLayout.ground.forEach((block) => {
    if (!combinedLayout[block.block]) {
      combinedLayout[block.block] = { ground: [], first: [] }
    }
    combinedLayout[block.block].ground = block.zones
  })

  hospitalLayout.first.forEach((block) => {
    if (!combinedLayout[block.block]) {
      combinedLayout[block.block] = { ground: [], first: [] }
    }
    combinedLayout[block.block].first = block.zones
  })

  const blockNames = Object.keys(combinedLayout)
  const filteredBlocks = blockFilter === "ALL" ? blockNames : blockNames.filter((b) => b === blockFilter)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Controls & Legend Header */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          padding: "16px 20px",
          borderRadius: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        {/* Block Filter Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "600" }}>Building:</span>
          {["ALL", ...blockNames].map((b) => (
            <button
              key={b}
              onClick={() => setBlockFilter(b)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: blockFilter === b ? "#38bdf8" : "#334155",
                background: blockFilter === b ? "#38bdf8" : "#1e293b",
                color: blockFilter === b ? "#0f172a" : "#f8fafc",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {b === "ALL" ? "All Blocks" : `Block ${b}`}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#cbd5e1" }}>
            <span style={{ width: "12px", height: "12px", background: "#ffffff", borderRadius: "3px", border: "1px solid #94a3b8" }} />
            <span>Empty</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#cbd5e1" }}>
            <span style={{ width: "12px", height: "12px", background: "#22c55e", borderRadius: "3px" }} />
            <span>Occupied</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#cbd5e1" }}>
            <span style={{ width: "12px", height: "12px", background: "#f97316", borderRadius: "3px" }} />
            <span>Held/Reserved</span>
          </div>
        </div>
      </div>

      {/* Blocks Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {filteredBlocks.map((blockName) => {
          const block = combinedLayout[blockName]
          if (!block) return null

          return (
            <div
              key={blockName}
              style={{
                background: "#080e1e",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
              }}
            >
              {/* Block Header Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "linear-gradient(90deg, #1e293b, #0f172a)",
                  border: "1px solid #334155",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  marginBottom: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🏢</span>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#facc15" }}>
                    Block {blockName}
                  </h3>
                </div>
              </div>

              {/* Ground Floor */}
              {block.ground && block.ground.length > 0 && (
                <div style={{ marginBottom: block.first && block.first.length > 0 ? "24px" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ width: "8px", height: "8px", background: "#38bdf8", borderRadius: "50%" }} />
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#38bdf8" }}>
                      Ground Floor
                    </h4>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                    {block.ground.map((zone) => (
                      <ZoneBox
                        key={zone.title}
                        title={zone.title}
                        beds={zone.beds}
                        columns={zone.columns}
                        activePatients={activePatients}
                        heldBeds={heldBeds}
                        onHoldToggle={onHoldToggle}
                        onBedClick={onBedClick}
                        highlightedPatients={highlightedPatients}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* First Floor */}
              {block.first && block.first.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ width: "8px", height: "8px", background: "#fb923c", borderRadius: "50%" }} />
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#fb923c" }}>
                      First Floor
                    </h4>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                    {block.first.map((zone) => (
                      <ZoneBox
                        key={zone.title}
                        title={zone.title}
                        beds={zone.beds}
                        columns={zone.columns}
                        activePatients={activePatients}
                        heldBeds={heldBeds}
                        onHoldToggle={onHoldToggle}
                        onBedClick={onBedClick}
                        highlightedPatients={highlightedPatients}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
