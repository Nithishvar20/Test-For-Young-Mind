// src/components/circuits/CircuitLab.jsx
import React, { useEffect, useState } from "react";

/*
  CircuitLab.jsx
  - realistic visuals for Resistor, Battery, LED, Switch, Wire
  - default grid: 4 cols x 4 rows
  - small MNA solver, iterative LED model (on/off as low/high resistance)
  - simple placement: select palette -> click start node -> click end node
  - inspector shows node voltages & component currents
*/

const TOPBAR_HEIGHT = 72;

// LED model constants
const LED_VF = 1.8; // diode threshold (V)
const LED_R_ON = 10; // smaller on-resistance (ohm) — tuned so driven LED shows visible current
const LED_R_OFF = 1e9; // effectively open
const LED_CURRENT_GLOW = 0.001; // 1 mA -> visible glow (lowered so faint currents still glow)

// id generator
let idCounter = 200;
const nextId = () => ++idCounter;

// default board size (cols x rows) — updated to 4x4 per request
const DEFAULT_COLS = 4; // horizontally
const DEFAULT_ROWS = 4; // vertically

export default function CircuitLab() {
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [rows, setRows] = useState(DEFAULT_ROWS);

  // palette & placement
  const [selectedType, setSelectedType] = useState("resistor");
  const [pendingNode, setPendingNode] = useState(null);

  // nodes & components
  const [nodes, setNodes] = useState(() => makeGridNodes(DEFAULT_COLS, DEFAULT_ROWS));
  const [comps, setComps] = useState([]);

  // simulation results
  const [solution, setSolution] = useState({ voltages: {}, currents: {} });

  // UI hover
  const [hoverNode, setHoverNode] = useState(null);

  useEffect(() => {
    setNodes(makeGridNodes(cols, rows));
  }, [cols, rows]);

  // whenever components change, resolve
  useEffect(() => {
    solveCircuit(comps, nodes, setSolution);
  }, [comps, nodes]);

  // placement: click node to start/end placement
  function onNodeClick(node) {
    if (!pendingNode) {
      setPendingNode(node);
      return;
    }
    // if clicked same node, cancel
    if (pendingNode.id === node.id) {
      setPendingNode(null);
      return;
    }
    const comp = createComponent(selectedType, pendingNode.id, node.id);
    setComps((s) => [...s, comp]);
    setPendingNode(null);
  }

  function createComponent(type, a, b) {
    const id = nextId();
    switch (type) {
      case "resistor":
        return { id, type, a, b, value: 220, label: "R" };
      case "battery":
        return { id, type, a, b, value: 9.0, label: "Bat" };
      case "led":
        return { id, type, a, b, label: "LED", meta: { r: LED_R_OFF } };
      case "switch":
        return { id, type, a, b, label: "SW", closed: true };
      case "wire":
        return { id, type, a, b, label: "W" };
      default:
        return { id, type, a, b, value: 0, label: type };
    }
  }

  function removeComponent(id) {
    setComps((s) => s.filter((c) => c.id !== id));
  }

  function changeCompValue(id, value) {
    setComps((s) => s.map((c) => (c.id === id ? { ...c, value } : c)));
  }

  function toggleSwitch(id) {
    setComps((s) => s.map((c) => (c.id === id ? { ...c, closed: !c.closed } : c)));
  }

  function clearCircuit() {
    setComps([]);
    setSolution({ voltages: {}, currents: {} });
    setPendingNode(null);
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 18,
        boxSizing: "border-box",
        background: "linear-gradient(180deg,#0b1220,#1b0920)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>
          Circuit Lab — Interactive Breadboard
        </h2>
        <div style={{ marginTop: 6, color: "rgba(255,255,255,0.78)" }}>
          Select a component, then click two nodes on the board to place it. LEDs glow when forward current flows.
        </div>
      </header>

      <div style={{ display: "flex", gap: 12, height: "calc(100% - 120px)" }}>
        {/* Palette */}
        <aside style={panelStyle}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Palette</div>

          <PaletteButton label="Resistor" type="resistor" selected={selectedType} onSelect={setSelectedType} />
          <PaletteButton label="Battery (V)" type="battery" selected={selectedType} onSelect={setSelectedType} />
          <PaletteButton label="LED (Diode)" type="led" selected={selectedType} onSelect={setSelectedType} />
          <PaletteButton label="Switch" type="switch" selected={selectedType} onSelect={setSelectedType} />
          <PaletteButton label="Wire" type="wire" selected={selectedType} onSelect={setSelectedType} />

          

          <div style={{ marginTop: 12 }}>
            <button onClick={clearCircuit} style={dangerBtn}>Clear Circuit</button>
          </div>

          
        </aside>

        {/* Board */}
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{
            height: "100%",
            borderRadius: 12,
            padding: 18,
            background: "linear-gradient(180deg,#071022,#081025)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
          }}>
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${cols * 120} ${rows * 100}`}
              style={{ display: "block" }}
            >
              <defs>
                <marker id="wire-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 z" fill="#ffd166" />
                </marker>
              </defs>

              {/* nodes grid */}
              {nodes.map((n) => (
                <circle
                  key={n.id}
                  cx={n.x}
                  cy={n.y}
                  r={pendingNode && pendingNode.id === n.id ? 7 : (hoverNode && hoverNode.id === n.id ? 5 : 3)}
                  fill={pendingNode && pendingNode.id === n.id ? "#a78bfa" : "#94a3b8"}
                  opacity={0.95}
                  onMouseEnter={() => setHoverNode(n)}
                  onMouseLeave={() => setHoverNode(null)}
                  onClick={() => onNodeClick(n)}
                  style={{ cursor: "pointer" }}
                />
              ))}

              {/* wires (draw first) */}
              {comps.filter(c => c.type === "wire").map((c) => (
                <WireSVG key={c.id} comp={c} nodes={nodes} solution={solution} />
              ))}

              {/* components */}
              {comps.map((c) => {
                if (c.type === "resistor") return <ResistorSVG key={c.id} comp={c} nodes={nodes} solution={solution} onEdit={changeCompValue} onRemove={removeComponent} />;
                if (c.type === "battery") return <BatterySVG key={c.id} comp={c} nodes={nodes} solution={solution} onEdit={changeCompValue} onRemove={removeComponent} />;
                if (c.type === "led") return <RealisticLEDSVG key={c.id} comp={c} nodes={nodes} solution={solution} onRemove={removeComponent} />;
                if (c.type === "switch") return <SwitchSVG key={c.id} comp={c} nodes={nodes} solution={solution} onToggle={toggleSwitch} onRemove={removeComponent} />;
                return null;
              })}
            </svg>
          </div>
        </div>

        {/* Inspector */}
        <aside style={panelStyleLarge}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Inspector</div>

          <div style={{ fontSize: 13, maxHeight: 260, overflow: "auto" }}>
            {comps.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No components placed.</div>}
            {comps.map((c) => (
              <div key={c.id} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.02)", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800 }}>{typeLabel(c.type)} <span style={{ color: "rgba(255,255,255,0.65)" }}>({c.id})</span></div>
                  <div>
                    {c.type === "switch" ? (
                      <button onClick={() => toggleSwitch(c.id)} style={smallBtn}>{c.closed ? "Open" : "Close"}</button>
                    ) : (
                      <button onClick={() => removeComponent(c.id)} style={smallBtn}>Remove</button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>nodes: {c.a}, {c.b}</div>

                {c.type === "resistor" && (
                  <div style={{ marginTop: 6 }}>
                    <input type="range" min={1} max={100000} value={c.value} onChange={(e) => changeCompValue(c.id, Number(e.target.value))} style={{ width: "100%" }} />
                    <div style={{ fontSize: 12, textAlign: "right" }}>{c.value} Ω</div>
                  </div>
                )}

                {c.type === "battery" && (
                  <div style={{ marginTop: 6 }}>
                    <input type="range" min={1} max={24} step={0.1} value={c.value} onChange={(e) => changeCompValue(c.id, Number(e.target.value))} style={{ width: "100%" }} />
                    <div style={{ fontSize: 12, textAlign: "right" }}>{c.value.toFixed(1)} V</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr style={{ border: "none", height: 1, background: "rgba(255,255,255,0.04)", margin: "10px 0" }} />

          <div style={{ fontWeight: 800 }}>Simulation</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>
            <div style={{ fontWeight: 700 }}>Node voltages (V)</div>
            <div style={{ maxHeight: 140, overflow: "auto", marginTop: 6 }}>
              {Object.keys(solution.voltages).length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>—</div>}
              {Object.entries(solution.voltages).map(([nid, v]) => (
                <div key={nid} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <div>Node {nid}</div>
                  <div>{Number(v).toFixed(3)} V</div>
                </div>
              ))}
            </div>

            <div style={{ fontWeight: 700, marginTop: 8 }}>Component currents (A)</div>
            <div style={{ maxHeight: 140, overflow: "auto", marginTop: 6 }}>
              {Object.keys(solution.currents).length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>—</div>}
              {Object.entries(solution.currents).map(([cid, i]) => (
                <div key={cid} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <div>Comp {cid}</div>
                  <div>{Number(i).toFixed(4)} A</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Helper UI pieces ---------- */
const panelStyle = {
  width: 220,
  background: "rgba(17,24,39,0.95)",
  borderRadius: 12,
  padding: 12,
  boxSizing: "border-box",
};
const panelStyleLarge = {
  width: 320,
  background: "rgba(17,24,39,0.95)",
  borderRadius: 12,
  padding: 12,
  boxSizing: "border-box",
};
const smallBtn = { background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", padding: "6px 8px", borderRadius: 8, cursor: "pointer" };
const dangerBtn = { ...smallBtn, background: "linear-gradient(90deg,#ef4444,#f97316)" };

function PaletteButton({ label, type, selected, onSelect }) {
  const active = selected === type;
  return (
    <div onClick={() => onSelect(type)} style={{
      display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, marginBottom: 8,
      cursor: "pointer",
      background: active ? "linear-gradient(90deg,#7c3aed,#a78bfa)" : "transparent"
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 8, background: active ? "#fff" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#7c3aed" : "#fff", fontWeight: 800 }}>
        {label[0]}
      </div>
      <div style={{ fontWeight: 800 }}>{label}</div>
    </div>
  );
}

function typeLabel(type) {
  switch (type) {
    case "resistor": return "Resistor";
    case "battery": return "Battery";
    case "led": return "LED";
    case "switch": return "Switch";
    case "wire": return "Wire";
    default: return type;
  }
}

/* ---------- SVG Component Visuals ---------- */

function findNode(nodes, id) {
  return nodes.find((n) => n.id === id) || { x: 0, y: 0 };
}

function angleBetween(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/* Wire - thick, glows with current */
function WireSVG({ comp, nodes, solution }) {
  const a = findNode(nodes, comp.a);
  const b = findNode(nodes, comp.b);
  const ia = Math.abs(solution.currents?.[comp.id] || 0);
  const stroke = wireColor(ia);
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={6} strokeLinecap="round" />;
}

/* Resistor - cylindrical/zigzag body + color bands */
function ResistorSVG({ comp, nodes, solution }) {
  const a = findNode(nodes, comp.a);
  const b = findNode(nodes, comp.b);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const theta = angleBetween(a, b);

  const i = Math.abs(solution.currents?.[comp.id] || 0);
  const glow = Math.min(1, i / 0.06);
  const bodyFill = glow > 0.05 ? `rgba(253,224,71,${0.25 + glow * 0.6})` : "#f59e0b";

  // render as rectangle + zigzag overlay
  return (
    <g transform={`translate(${mid.x},${mid.y}) rotate(${theta})`}>
      <line x1={-48} y1={0} x2={-28} y2={0} stroke="#9aa6b2" strokeWidth={4} />
      <line x1={28} y1={0} x2={48} y2={0} stroke="#9aa6b2" strokeWidth={4} />

      <rect x={-28} y={-14} width={56} height={28} rx={10} fill={bodyFill} stroke="#111827" strokeWidth={2} />
      {/* zigzag */}
      <polyline points="-22,0 -14,-8 -6,8 2,-8 10,8 18,-8 26,0" fill="none" stroke="#111827" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {/* color bands */}
      <rect x={-6} y={-14} width={6} height={28} fill="#111827" />
      <rect x={4} y={-14} width={6} height={28} fill="#4ade80" />
      <rect x={14} y={-14} width={6} height={28} fill="#ef4444" />
      <text x={0} y={36} fill="#fff" fontSize={12} textAnchor="middle">{comp.value} Ω</text>
    </g>
  );
}

/* Battery - plates with + / - labels */
function BatterySVG({ comp, nodes }) {
  const a = findNode(nodes, comp.a);
  const b = findNode(nodes, comp.b);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const theta = angleBetween(a, b);

  return (
    <g transform={`translate(${mid.x},${mid.y}) rotate(${theta})`}>
      <line x1={-48} y1={0} x2={-20} y2={0} stroke="#9aa6b2" strokeWidth={4} />
      <line x1={20} y1={0} x2={48} y2={0} stroke="#9aa6b2" strokeWidth={4} />

      {/* longer positive plate (left) and shorter negative (right) */}
      <line x1={-10} y1={-22} x2={-10} y2={22} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <line x1={10} y1={-12} x2={10} y2={12} stroke="#fff" strokeWidth={10} strokeLinecap="round" />

      <text x={0} y={36} fill="#fff" fontSize={12} textAnchor="middle">{comp.value.toFixed(1)} V</text>
      <text x={-10} y={-28} fill="#22c1ff" fontSize={12} textAnchor="middle">+</text>
      <text x={10} y={28} fill="#ff7a7a" fontSize={12} textAnchor="middle">−</text>
    </g>
  );
}

/* LED - realistic dome, metallic legs and halo glow */
function RealisticLEDSVG({ comp, nodes, solution }) {
  const a = findNode(nodes, comp.a);
  const b = findNode(nodes, comp.b);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const theta = angleBetween(a, b);

  const iVal = solution.currents?.[comp.id] || 0;
  const currentAbs = Math.abs(iVal);
  const glow = Math.min(1, currentAbs / LED_CURRENT_GLOW);
  const on = glow > 0.06; // visible threshold

  // LED color - make subtle red; could be parameterized
  const color = "#ff6b6b";

  return (
    <g transform={`translate(${mid.x},${mid.y}) rotate(${theta})`}>
      {/* legs */}
      <line x1={-48} y1={0} x2={-16} y2={0} stroke="#bbb" strokeWidth={4} />
      <line x1={16} y1={0} x2={48} y2={0} stroke="#bbb" strokeWidth={4} />

      {/* metallic leads into body */}
      <line x1={-16} y1={0} x2={-6} y2={0} stroke="#777" strokeWidth={3} />
      <line x1={6} y1={0} x2={16} y2={0} stroke="#777" strokeWidth={3} />

      {/* lens dome (ellipse) */}
      <ellipse cx={0} cy={0} rx={18} ry={22} fill={on ? color : "#5b1f1f"} stroke="#111827" strokeWidth={1.5} />
      {/* highlight to look glassy */}
      <ellipse cx={-6} cy={-6} rx={6} ry={4} fill="rgba(255,255,255,0.35)" opacity={on ? 0.9 : 0.45} />

      {/* diode symbol inside (simplified) */}
      <polygon points="-6,-6 -6,6 6,0" fill={on ? "#fff" : "#ffd"} opacity={0.9} />
      <line x1={8} y1={-8} x2={14} y2={-14} stroke={on ? "#fffafa" : "#ffd"} strokeWidth={1.6} />
      <line x1={8} y1={8} x2={14} y2={14} stroke={on ? "#fffafa" : "#ffd"} strokeWidth={1.6} />

      {/* glow halo */}
      {on && (
        <>
          <circle cx={0} cy={0} r={36} fill={`${color}`} opacity={0.12 * glow} style={{ filter: "blur(6px)" }} />
          <circle cx={0} cy={0} r={56 * glow} fill={color} opacity={0.06 * glow} style={{ filter: "blur(12px)" }} />
        </>
      )}

      <text x={0} y={40} fill="#fff" fontSize={12} textAnchor="middle">LED</text>
    </g>
  );
}

/* Switch - lever that toggles closed/open */
function SwitchSVG({ comp, nodes, onToggle }) {
  const a = findNode(nodes, comp.a);
  const b = findNode(nodes, comp.b);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const theta = angleBetween(a, b);
  const closed = !!comp.closed;

  return (
    <g transform={`translate(${mid.x},${mid.y}) rotate(${theta})`}>
      <line x1={-48} y1={0} x2={-12} y2={0} stroke="#9aa6b2" strokeWidth={4} />
      <line x1={12} y1={0} x2={48} y2={0} stroke="#9aa6b2" strokeWidth={4} />

      <rect x={-18} y={-12} width={36} height={24} rx={6} fill={closed ? "#34d399" : "#374151"} stroke="#000" strokeWidth={1} />
      <circle cx={closed ? 8 : -8} cy={0} r={6} fill="#fff" stroke="#000" strokeWidth={1} style={{ cursor: "pointer" }} onClick={() => onToggle(comp.id)} />

      <text x={0} y={40} fill="#fff" fontSize={12} textAnchor="middle">Switch</text>
    </g>
  );
}

/* ---------- small visual helpers ---------- */
function wireColor(iAbs) {
  const v = Math.min(8, iAbs * 2);
  if (v < 0.3) return "rgba(148,163,184,0.12)";
  if (v < 1.0) return "rgba(124,58,237,0.9)";
  if (v < 3.0) return "rgba(34,211,238,0.95)";
  return "rgba(253,224,71,0.98)";
}

/* ---------- Small MNA solver with iterative LED model ---------- */

/*
  Approach:
  - Build list of used nodes in components
  - Stamp resistors/wires as conductances
  - Stamp batteries as MNA voltage sources
  - Stamp switches as closed (wire) or open
  - LEDs: iterate with small model r_off / r_on until state stable
*/

function solveCircuit(comps, nodes, setSolution) {
  if (!comps || comps.length === 0) {
    setSolution({ voltages: {}, currents: {} });
    return;
  }

  // collect used node ids
  const usedNodeIds = new Set();
  comps.forEach((c) => { usedNodeIds.add(c.a); usedNodeIds.add(c.b); });
  const nodeList = Array.from(usedNodeIds).sort((a, b) => a - b);
  const N = nodeList.length;
  if (N === 0) {
    setSolution({ voltages: {}, currents: {} });
    return;
  }
  const nodeIndex = {};
  nodeList.forEach((nid, i) => nodeIndex[nid] = i);

  // classify elements
  const resistors = [];
  const vSources = [];
  const leds = [];
  comps.forEach((c) => {
    if (c.type === "resistor") {
      resistors.push({ id: c.id, a: nodeIndex[c.a], b: nodeIndex[c.b], g: 1 / Math.max(1e-12, c.value) });
    } else if (c.type === "wire") {
      resistors.push({ id: c.id, a: nodeIndex[c.a], b: nodeIndex[c.b], g: 1 / 1e-6 });
    } else if (c.type === "battery") {
      vSources.push({ id: c.id, a: nodeIndex[c.a], b: nodeIndex[c.b], V: c.value });
    } else if (c.type === "led") {
      leds.push({ id: c.id, a: nodeIndex[c.a], b: nodeIndex[c.b], r_on: LED_R_ON, r_off: LED_R_OFF, state: "off", r: LED_R_OFF });
    } else if (c.type === "switch") {
      if (c.closed) resistors.push({ id: c.id, a: nodeIndex[c.a], b: nodeIndex[c.b], g: 1 / 1e-6 });
    }
  });

  // iterate LED states
  let ledsState = leds.map(l => ({ ...l }));
  let finalVoltages = {};
  let finalCurrents = {};

  const MAX_ITERS = 14;
  for (let iter = 0; iter < MAX_ITERS; iter++) {
    // MNA size: N nodes + M voltage sources
    const M = vSources.length;
    const size = N + M;

    // allocate A and z
    const A = Array.from({ length: size }, () => Array(size).fill(0));
    const z = Array(size).fill(0);

    // stamp resistors
    resistors.forEach(r => {
      const g = r.g;
      const a = r.a, b = r.b;
      if (a !== undefined) A[a][a] += g;
      if (b !== undefined) A[b][b] += g;
      if (a !== undefined && b !== undefined) {
        A[a][b] -= g;
        A[b][a] -= g;
      }
    });

    // stamp LEDs as resistors with current guessed r
    ledsState.forEach(l => {
      const g = 1 / Math.max(1e-12, l.r);
      const a = l.a, b = l.b;
      if (a !== undefined) A[a][a] += g;
      if (b !== undefined) A[b][b] += g;
      if (a !== undefined && b !== undefined) {
        A[a][b] -= g;
        A[b][a] -= g;
      }
    });

    // stamp voltage sources
    vSources.forEach((vs, idx) => {
      const col = N + idx;
      const a = vs.a, b = vs.b;
      if (a !== undefined) A[a][col] += 1;
      if (b !== undefined) A[b][col] += -1;
      if (a !== undefined) A[col][a] += 1;
      if (b !== undefined) A[col][b] += -1;
      z[N + idx] = vs.V;
    });

    // tiny leak to ground for each node to avoid singular matrix (stable numerics)
    const LEAK_G = 1e-12;
    for (let i = 0; i < N; i++) A[i][i] += LEAK_G;

    const x = solveLinear(A, z);
    if (!x) { finalVoltages = {}; finalCurrents = {}; break; }

    // extract node voltages
    const voltages = {};
    nodeList.forEach((nid, i) => voltages[nid] = x[i]);

    // compute currents
    const currents = {};
    comps.forEach(c => {
      if (c.type === "resistor") {
        const a = nodeIndex[c.a], b = nodeIndex[c.b];
        const Va = x[a] || 0, Vb = x[b] || 0;
        currents[c.id] = (Va - Vb) / Math.max(1e-12, c.value);
      } else if (c.type === "wire") {
        const a = nodeIndex[c.a], b = nodeIndex[c.b];
        const Va = x[a] || 0, Vb = x[b] || 0;
        currents[c.id] = (Va - Vb) / 1e-6;
      } else if (c.type === "battery") {
        const vsIdx = vSources.findIndex(v => v.id === c.id);
        currents[c.id] = vsIdx >= 0 ? x[N + vsIdx] : 0;
      } else if (c.type === "led") {
        const ls = ledsState.find(l => l.id === c.id);
        const a = nodeIndex[c.a], b = nodeIndex[c.b];
        const Va = x[a] || 0, Vb = x[b] || 0;
        currents[c.id] = (Va - Vb) / (ls.r || LED_R_OFF);
      } else if (c.type === "switch") {
        currents[c.id] = 0;
      } else currents[c.id] = 0;
    });

    // update LED states based on voltage across them
    let changed = false;
    ledsState = ledsState.map(l => {
      const a = l.a, b = l.b;
      const Va = x[a] || 0, Vb = x[b] || 0;
      const Vd = Va - Vb;
      const shouldBeOn = Math.abs(Vd) >= LED_VF;
      const newState = shouldBeOn ? "on" : "off";
      const newR = shouldBeOn ? l.r_on : l.r_off;
      if (newState !== l.state || newR !== l.r) changed = true;
      return { ...l, state: newState, r: newR };
    });

    finalVoltages = voltages;
    finalCurrents = currents;

    if (!changed) break;
  }

  setSolution({ voltages: finalVoltages, currents: finalCurrents });
}

/* small dense linear solver (Gaussian elimination) */
function solveLinear(A, b) {
  const n = A.length;
  const M = A.map(r => r.slice());
  const y = b.slice();

  for (let k = 0; k < n; k++) {
    // pivot
    let maxRow = k;
    let maxVal = Math.abs(M[k][k]);
    for (let r = k + 1; r < n; r++) {
      if (Math.abs(M[r][k]) > maxVal) { maxVal = Math.abs(M[r][k]); maxRow = r; }
    }
    if (Math.abs(maxVal) < 1e-14) return null;
    if (maxRow !== k) {
      [M[k], M[maxRow]] = [M[maxRow], M[k]];
      [y[k], y[maxRow]] = [y[maxRow], y[k]];
    }
    const pivot = M[k][k];
    for (let j = k; j < n; j++) M[k][j] /= pivot;
    y[k] /= pivot;
    for (let i = k + 1; i < n; i++) {
      const factor = M[i][k];
      if (Math.abs(factor) < 1e-15) continue;
      for (let j = k; j < n; j++) M[i][j] -= factor * M[k][j];
      y[i] -= factor * y[k];
    }
  }

  // back substitution
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

/* make grid */
function makeGridNodes(cols, rows) {
  const nodes = [];
  const spacingX = 120, spacingY = 100;
  let id = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({ id: id++, row: r, col: c, x: 60 + c * spacingX, y: 60 + r * spacingY });
    }
  }
  return nodes;
}