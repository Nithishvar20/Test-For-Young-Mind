// src/components/CellExplorer.jsx
import React from "react";

export default function CellExplorer() {
  const [selected, setSelected] = React.useState(null);

  const parts = [
    { id: "nucleus", cx: 220, cy: 140, r: 50, fill: "#f472b6", name: "Nucleus", desc: "Contains genetic material (DNA)." },
    { id: "mito", cx: 320, cy: 200, r: 22, fill: "#60a5fa", name: "Mitochondrion", desc: "Energy production site (ATP)." },
    { id: "vacuole", cx: 120, cy: 210, r: 30, fill: "#34d399", name: "Vacuole", desc: "Storage of nutrients and waste." },
    { id: "membrane", cx: 220, cy: 180, r: 140, fill: "none", stroke: "rgba(255,255,255,0.08)", name: "Cell Membrane", desc: "Boundary of the cell." },
  ];

  return (
    <div>
      <h2 style={{ color: "#fff" }}>Cell Explorer</h2>
      <p style={{ color: "rgba(255,255,255,0.8)" }}>Click an organelle to learn about it.</p>

      <div style={{ display: "flex", gap: 18, marginTop: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ width: 520, height: 360, borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 12 }}>
          <svg viewBox="0 0 440 360" width="100%" height="100%">
            {/* Cell membrane */}
            <circle cx={220} cy={180} r={140} fill="rgba(0,0,0,0)" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />

            {parts.map((p) => (
              <g key={p.id} onClick={() => setSelected(p)} style={{ cursor: "pointer" }}>
                <circle cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} stroke={p.stroke || "none"} opacity={0.95} />
                {/* label small */}
              </g>
            ))}
          </svg>
        </div>

        <div style={{ minWidth: 240, color: "rgba(255,255,255,0.9)" }}>
          <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
            {selected ? (
              <>
                <h3 style={{ margin: 0 }}>{selected.name}</h3>
                <p style={{ marginTop: 8 }}>{selected.desc}</p>
              </>
            ) : (
              <div>Select an organelle to see details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}