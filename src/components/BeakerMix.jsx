// src/components/BeakerMix.jsx
import React from "react";

const REAGENTS = [
  { id: "red", name: "Red", color: "#ff6b6b" },
  { id: "blue", name: "Blue", color: "#60a5fa" },
  { id: "yellow", name: "Yellow", color: "#f6e05e" },
  { id: "green", name: "Green", color: "#34d399" },
];

function blendColors(colors) {
  if (!colors.length) return "rgba(255,255,255,0.03)";
  // average RGB
  let r = 0,
    g = 0,
    b = 0;
  colors.forEach((hex) => {
    const c = hex.replace("#", "");
    const ri = parseInt(c.substring(0, 2), 16);
    const gi = parseInt(c.substring(2, 4), 16);
    const bi = parseInt(c.substring(4, 6), 16);
    r += ri;
    g += gi;
    b += bi;
  });
  r = Math.round(r / colors.length);
  g = Math.round(g / colors.length);
  b = Math.round(b / colors.length);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function BeakerMix() {
  const [inBeaker, setInBeaker] = React.useState([]);

  function addReagent(id) {
    const reagent = REAGENTS.find((r) => r.id === id);
    if (!reagent) return;
    setInBeaker((s) => [...s, reagent.color]);
  }

  function clearBeaker() {
    setInBeaker([]);
  }

  const fillColor = blendColors(inBeaker);

  return (
    <div>
      <h2 style={{ color: "#fff" }}>Beaker Mixing</h2>
      <p style={{ color: "rgba(255,255,255,0.8)" }}>Click reagents to add to the beaker and see the color change.</p>

      <div style={{ display: "flex", gap: 18, marginTop: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          {REAGENTS.map((r) => (
            <button
              key={r.id}
              onClick={() => addReagent(r.id)}
              style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: r.color, color: "#000", fontWeight: 700 }}
            >
              {r.name}
            </button>
          ))}

          <button onClick={clearBeaker} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, border: "none", background: "#6b46c1", color: "#fff" }}>
            Clear
          </button>
        </div>

        <div style={{ width: 300, height: 300, borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 18 }}>
          <div style={{ height: 220, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div
              style={{
                width: 140,
                height: 160,
                border: "6px solid rgba(255,255,255,0.06)",
                borderRadius: 6,
                position: "relative",
                overflow: "hidden",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {/* beaker fill */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: `${Math.min(100, 10 * inBeaker.length + 10)}%`,
                  background: fillColor,
                  transition: "background 300ms, height 300ms",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 12, color: "rgba(255,255,255,0.8)" }}>
            <strong>Beaker contents:</strong>
            <div>{inBeaker.length ? `${inBeaker.length} reagent(s)` : "empty"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}