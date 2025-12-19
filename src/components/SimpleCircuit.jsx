// src/components/SimpleCircuit.jsx
import React, { useEffect, useMemo, useState } from "react";

/*
Patched SimpleCircuit.jsx
- Tap-to-place components into fixed slots (no drag/drop)
- Tap-to-connect terminals
- Linear solver: Modified Nodal Analysis (MNA) for resistors + ideal voltage sources
- LED model: piecewise-linear diode with tiny leakage below Vf and series forward Rf when conducting
- Animated electrons on wires proportional to absolute current magnitude
- Shows node voltages and element currents
*/

const SLOT_LAYOUT = [
  { id: "S1", x: 140, y: 110 },
  { id: "S2", x: 360, y: 110 },
  { id: "S3", x: 580, y: 110 },
  { id: "S4", x: 140, y: 260 },
  { id: "S5", x: 360, y: 260 },
  { id: "S6", x: 580, y: 260 },
];

const TYPES = {
  BATTERY: "battery",
  RESISTOR: "resistor",
  LED: "led",
};

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

// Small, safe linear solver (Gaussian elimination). Returns null on singular.
function solveLinear(A, b) {
  const n = A.length;
  const M = A.map((r) => r.slice());
  const B = b.slice();
  const EPS = 1e-12;

  for (let k = 0; k < n; k++) {
    // pivot
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[maxRow][k])) maxRow = i;
    }
    if (Math.abs(M[maxRow][k]) < EPS) return null;
    [M[k], M[maxRow]] = [M[maxRow], M[k]];
    [B[k], B[maxRow]] = [B[maxRow], B[k]];

    const pivot = M[k][k];
    for (let j = k; j < n; j++) M[k][j] /= pivot;
    B[k] /= pivot;

    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const f = M[i][k];
      if (Math.abs(f) < EPS) continue;
      for (let j = k; j < n; j++) M[i][j] -= f * M[k][j];
      B[i] -= f * B[k];
    }
  }

  return B;
}

// Build nodes from terminals connected by wires
// terminals are strings like "S1:L" or "S2:R"
function buildNodes(placed, wires) {
  const terminalList = [];
  const tcoords = {}; // for drawing
  placed.forEach((p) => {
    const left = `${p.slotId}:L`;
    const right = `${p.slotId}:R`;
    terminalList.push(left, right);
    tcoords[left] = { x: p.x - 38, y: p.y };
    tcoords[right] = { x: p.x + 38, y: p.y };
  });

  const adj = {};
  terminalList.forEach((t) => (adj[t] = new Set()));
  wires.forEach((w) => {
    const a = `${w.a.slotId}:${w.a.terminal}`;
    const b = `${w.b.slotId}:${w.b.terminal}`;
    if (adj[a]) adj[a].add(b);
    if (adj[b]) adj[b].add(a);
  });

  const groups = [];
  const seen = new Set();
  terminalList.forEach((t) => {
    if (seen.has(t)) return;
    const stack = [t];
    const group = [];
    seen.add(t);
    while (stack.length) {
      const cur = stack.pop();
      group.push(cur);
      adj[cur].forEach((n) => {
        if (!seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
      });
    }
    groups.push(group);
  });

  const nodes = groups.map((g, idx) => {
    const pts = g.map((term) => tcoords[term] || { x: 0, y: 0 });
    const avg = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    avg.x /= pts.length;
    avg.y /= pts.length;
    return { id: `N${idx}`, terms: g, x: Math.round(avg.x), y: Math.round(avg.y) };
  });

  const termToNode = {};
  nodes.forEach((n) => n.terms.forEach((t) => (termToNode[t] = n.id)));

  return { nodes, termToNode };
}

// Build MNA and solve linear circuit.
// placed: [{id,slotId,type,props,x,y}], wires: [{id,a:{slotId,terminal},b:{...}}]
function solveCircuit(placed, wires) {
  // Build nodes
  if (placed.length === 0) return { success: false };
  const { nodes, termToNode } = buildNodes(placed, wires);
  if (!nodes.length) return { success: false };

  // pick reference node (choose last)
  const refNode = nodes[nodes.length - 1].id;
  const nonRef = nodes.filter((n) => n.id !== refNode).map((n) => n.id);
  const nodeIndex = {};
  nonRef.forEach((nid, i) => (nodeIndex[nid] = i));
  const N = nonRef.length;

  // collect voltage sources and linear elements
  const vsources = []; // {id, posNode, negNode, V}
  const resistors = []; // {id, n1, n2, R}
  const leds = []; // piecewise-linear: {id, n1, n2, Vf, Rf}
  placed.forEach((pc) => {
    const leftTerm = `${pc.slotId}:L`;
    const rightTerm = `${pc.slotId}:R`;
    const n1 = termToNode[leftTerm];
    const n2 = termToNode[rightTerm];
    if (!n1 || !n2) return; // terminal not connected yet
    if (pc.type === TYPES.BATTERY) {
      const V = (pc.props && pc.props.v) || 9.0;
      vsources.push({ id: pc.id, posNode: n2, negNode: n1, V });
    } else if (pc.type === TYPES.RESISTOR) {
      const R = (pc.props && pc.props.r) || 10;
      resistors.push({ id: pc.id, n1, n2, R });
    } else if (pc.type === TYPES.LED) {
      // piecewise-linear LED model parameters stored in props
      const Vf = (pc.props && pc.props.Vf) || 2.0;
      const Rf = (pc.props && pc.props.Rf) || 12.0; // forward slope resistance when conducting
      const Rleak = (pc.props && pc.props.Rleak) || 1e6; // leakage path below Vf
      leds.push({ id: pc.id, n1, n2, Vf, Rf, Rleak });
    }
  });

  const M = vsources.length;
  const size = N + M;
  if (size === 0) {
    // trivial: only reference node
    const voltages = {};
    nodes.forEach((n) => (voltages[n.id] = 0));
    return { success: true, nodeVoltages: voltages, elementCurrents: {} };
  }

  // stamping helper that accepts a map of which LEDs are treated as ON (conducting)
  function stampAndSolve(ledOnMap) {
    const A = Array.from({ length: size }, () => Array(size).fill(0));
    const b = Array(size).fill(0);

    // stamp resistors
    resistors.forEach((r) => {
      const G = 1 / Math.max(1e-9, r.R);
      if (r.n1 !== refNode) {
        const i = nodeIndex[r.n1];
        A[i][i] += G;
        if (r.n2 !== refNode) {
          const j = nodeIndex[r.n2];
          A[i][j] -= G;
          A[j][j] += G;
          A[j][i] -= G;
        }
      } else if (r.n2 !== refNode) {
        const j = nodeIndex[r.n2];
        A[j][j] += G;
      }
    });

    // stamp LEDs: if ON -> series Vf + Rf approximated by conductance G and RHS offset; if OFF -> leakage G_leak
    leds.forEach((led) => {
      const mode = ledOnMap[led.id];
      if (mode === "ON") {
        const G = 1 / Math.max(1e-9, led.Rf);
        const n1 = led.n1, n2 = led.n2;
        if (n1 !== refNode) {
          const i = nodeIndex[n1];
          A[i][i] += G;
          if (n2 !== refNode) {
            const j = nodeIndex[n2];
            A[i][j] -= G;
            A[j][j] += G;
            A[j][i] -= G;
          }
          b[i] -= G * led.Vf;
        } else if (n2 !== refNode) {
          const j = nodeIndex[n2];
          A[j][j] += G;
          b[j] += G * led.Vf;
        }
      } else {
        // LEAK mode: small conductance
        const G = 1 / Math.max(1e-9, led.Rleak);
        const n1 = led.n1, n2 = led.n2;
        if (n1 !== refNode) {
          const i = nodeIndex[n1];
          A[i][i] += G;
          if (n2 !== refNode) {
            const j = nodeIndex[n2];
            A[i][j] -= G;
            A[j][j] += G;
            A[j][i] -= G;
          }
        } else if (n2 !== refNode) {
          const j = nodeIndex[n2];
          A[j][j] += G;
        }
      }
    });

    // stamp voltage sources (MNA)
    vsources.forEach((vs, k) => {
      const row = N + k;
      const pos = vs.posNode;
      const neg = vs.negNode;
      if (pos !== refNode) {
        const i = nodeIndex[pos];
        A[i][row] += 1;
        A[row][i] += 1;
      }
      if (neg !== refNode) {
        const j = nodeIndex[neg];
        A[j][row] -= 1;
        A[row][j] -= 1;
      }
      b[row] = vs.V;
    });

    const x = solveLinear(A, b);
    return { x, A, b };
  }

  // PASS 1: assume all LEDs are LEAK (off)
  const ledOnGuess = {};
  leds.forEach((l) => (ledOnGuess[l.id] = "LEAK"));
  const p1 = stampAndSolve(ledOnGuess);
  if (!p1.x) return { success: false, reason: "singular (pass1)" };

  // compute node voltages from p1
  const VnodesP1 = {};
  nodes.forEach((n) => {
    VnodesP1[n.id] = n.id === refNode ? 0 : p1.x[nodeIndex[n.id]];
  });

  // determine which LEDs should conduct: if Vd > Vf then ON, else LEAK
  const ledOnMap = {};
  leds.forEach((l) => {
    const Vn1 = VnodesP1[l.n1] ?? 0;
    const Vn2 = VnodesP1[l.n2] ?? 0;
    const Vd = Vn1 - Vn2;
    ledOnMap[l.id] = Vd > l.Vf - 1e-6 ? "ON" : "LEAK";
  });

  // PASS 2: stamp with LED modes determined
  const p2 = stampAndSolve(ledOnMap);
  if (!p2.x) return { success: false, reason: "singular (pass2)" };

  // final node voltages
  const nodeVoltages = {};
  nodes.forEach((n) => {
    nodeVoltages[n.id] = n.id === refNode ? 0 : p2.x[nodeIndex[n.id]];
  });

  // compute element currents
  const elementCurrents = {};
  // resistors
  resistors.forEach((r) => {
    const v1 = nodeVoltages[r.n1] ?? 0;
    const v2 = nodeVoltages[r.n2] ?? 0;
    elementCurrents[r.id] = (v1 - v2) / r.R;
  });
  // leds
  leds.forEach((l) => {
    if (ledOnMap[l.id] === "LEAK") {
      // leakage current approximated by Vd / Rleak
      const v1 = nodeVoltages[l.n1] ?? 0;
      const v2 = nodeVoltages[l.n2] ?? 0;
      elementCurrents[l.id] = (v1 - v2) / l.Rleak;
    } else {
      const v1 = nodeVoltages[l.n1] ?? 0;
      const v2 = nodeVoltages[l.n2] ?? 0;
      elementCurrents[l.id] = (v1 - v2 - l.Vf) / l.Rf;
    }
  });
  // voltage source currents: indices N..N+M-1 in p2.x
  vsources.forEach((vs, idx) => {
    const I = p2.x[N + idx] ?? 0;
    elementCurrents[vs.id] = I;
  });

  return { success: true, nodeVoltages, elementCurrents, nodes, resistors, leds, vsources };
}

// ----------------- React component -----------------

export default function SimpleCircuit() {
  const [placed, setPlaced] = useState([]); // {id,slotId,type,props,x,y}
  const [wires, setWires] = useState([]); // {id,a:{slotId,terminal},b:{slotId,terminal}}
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [selectedTool, setSelectedTool] = useState(TYPES.BATTERY);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 10000), 60);
    return () => clearInterval(id);
  }, []);

  // helper: place component in slot (replace if exists)
  function placeComponentImpl(slotId, type) {
    const slot = SLOT_LAYOUT.find((s) => s.id === slotId);
    if (!slot) return;
    setPlaced((prev) => {
      const existing = prev.find((p) => p.slotId === slotId);
      const base = {
        id: existing ? existing.id : uid("pc_"),
        slotId,
        type,
        x: slot.x,
        y: slot.y,
        props:
          type === TYPES.BATTERY
            ? { v: 9.0 }
            : type === TYPES.RESISTOR
            ? { r: 10.0 }
            : { Vf: 2.0, Rf: 12.0, Rleak: 1e6 },
      };
      if (existing) return prev.map((p) => (p.slotId === slotId ? base : p));
      return [...prev, base];
    });
  }

  function removeComponent(slotId) {
    setPlaced((prev) => prev.filter((p) => p.slotId !== slotId));
    setWires((prev) => prev.filter((w) => w.a.slotId !== slotId && w.b.slotId !== slotId));
    setConnectingFrom(null);
  }

  function onTerminalTapImpl(slotId, terminal) {
    const term = { slotId, terminal };
    if (!connectingFrom) {
      setConnectingFrom(term);
      return;
    }
    // same terminal tapped -> cancel
    if (connectingFrom.slotId === slotId && connectingFrom.terminal === terminal) {
      setConnectingFrom(null);
      return;
    }
    // prevent duplicate wires
    const exists = wires.some((w) => {
      const a = `${w.a.slotId}:${w.a.terminal}`;
      const b = `${w.b.slotId}:${w.b.terminal}`;
      const a2 = `${connectingFrom.slotId}:${connectingFrom.terminal}`;
      const b2 = `${slotId}:${terminal}`;
      return (a === a2 && b === b2) || (a === b2 && b === a2);
    });
    if (!exists) {
      setWires((prev) => [...prev, { id: uid("w_"), a: connectingFrom, b: { slotId, terminal } }]);
    }
    setConnectingFrom(null);
  }

  // wrapper for solver input
  const placedForSolver = useMemo(
    () => placed.map((p) => ({ id: p.id, slotId: p.slotId, type: p.type, props: p.props, x: p.x, y: p.y })),
    [placed]
  );

  const solveResult = useMemo(() => solveCircuit(placedForSolver, wires), [placedForSolver, wires]);

  function autoWireDemo() {
    placeComponentImpl("S1", TYPES.BATTERY);
    placeComponentImpl("S3", TYPES.RESISTOR);
    placeComponentImpl("S5", TYPES.LED);
    setTimeout(() => {
      setWires([
        { id: uid(), a: { slotId: "S1", terminal: "R" }, b: { slotId: "S3", terminal: "L" } },
        { id: uid(), a: { slotId: "S3", terminal: "R" }, b: { slotId: "S5", terminal: "L" } },
        { id: uid(), a: { slotId: "S5", terminal: "R" }, b: { slotId: "S1", terminal: "L" } },
      ]);
    }, 120);
  }

  // LED brightness function maps current to smooth brightness [0..1]
  function ledBrightness(pc) {
    if (!solveResult.success) return 0;
    const I = Math.abs(solveResult.elementCurrents?.[pc.id] ?? 0);
    const b = Math.max(0, Math.min(1, I / 0.02));
    return b;
  }

  // helper to get terminals coords
  function terminalsOf(slotId) {
    const s = SLOT_LAYOUT.find((ss) => ss.id === slotId);
    return [
      { slotId, terminal: "L", x: s.x - 38, y: s.y },
      { slotId, terminal: "R", x: s.x + 38, y: s.y },
    ];
  }

  return (
    <div style={{ color: "#fff" }}>
      <h2 style={{ marginTop: 0 }}>Circuit Builder — Stable</h2>
      <p style={{ color: "rgba(255,255,255,0.85)" }}>
        Tap a slot to place the selected component. Tap two terminals to connect them. Solver computes steady-state DC currents using MNA.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        {/* Left panel */}
        <div style={{ width: 240 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 800 }}>Select component</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setSelectedTool(TYPES.BATTERY)} style={{ flex: 1, padding: 8, borderRadius: 8, background: selectedTool === TYPES.BATTERY ? "#f59e0b" : "rgba(255,255,255,0.03)" }}>Battery</button>
              <button onClick={() => setSelectedTool(TYPES.RESISTOR)} style={{ flex: 1, padding: 8, borderRadius: 8, background: selectedTool === TYPES.RESISTOR ? "#60a5fa" : "rgba(255,255,255,0.03)" }}>Resistor</button>
              <button onClick={() => setSelectedTool(TYPES.LED)} style={{ flex: 1, padding: 8, borderRadius: 8, background: selectedTool === TYPES.LED ? "#f472b6" : "rgba(255,255,255,0.03)" }}>LED</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800 }}>Actions</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => { setPlaced([]); setWires([]); setConnectingFrom(null); }} style={{ flex: 1, padding: 8, borderRadius: 8, background: "#ef4444", color: "#fff" }}>Reset</button>
                <button onClick={autoWireDemo} style={{ flex: 1, padding: 8, borderRadius: 8, background: "#06b6d4" }}>Auto-wire</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800 }}>Solver status</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                {solveResult.success ? <span style={{ color: "#34d399" }}>OK — solved</span> : <span style={{ color: "tomato" }}>No complete network</span>}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800 }}>Nodes & voltages</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                {solveResult.nodes?.map((n) => (
                  <div key={n.id}>{n.id}: {(solveResult.nodeVoltages?.[n.id] ?? 0).toFixed(3)} V</div>
                )) || <div style={{ color: "rgba(255,255,255,0.6)" }}>No nodes</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Board */}
        <div style={{ flex: 1 }}>
          <div style={{ background: "linear-gradient(180deg,#07101a,#0b1220)", padding: 12, borderRadius: 8 }}>
            <svg width="820" height="420" style={{ display: "block" }}>
              {/* wires & animated electrons */}
              {wires.map((w) => {
                const aSlot = SLOT_LAYOUT.find((s) => s.id === w.a.slotId);
                const bSlot = SLOT_LAYOUT.find((s) => s.id === w.b.slotId);
                if (!aSlot || !bSlot) return null;
                const ax = aSlot.x + (w.a.terminal === "L" ? -38 : 38);
                const ay = aSlot.y;
                const bx = bSlot.x + (w.b.terminal === "L" ? -38 : 38);
                const by = bSlot.y;
                let currentMag = 0;
                const compA = placed.find((p) => p.slotId === w.a.slotId);
                const compB = placed.find((p) => p.slotId === w.b.slotId);
                if (compA && solveResult.elementCurrents?.[compA.id] != null) currentMag = Math.abs(solveResult.elementCurrents[compA.id]);
                else if (compB && solveResult.elementCurrents?.[compB.id] != null) currentMag = Math.abs(solveResult.elementCurrents[compB.id]);

                const len = Math.hypot(bx - ax, by - ay);
                const dots = Math.max(2, Math.min(12, Math.round(2 + currentMag * 200)));
                const speedFactor = 0.02 + Math.min(0.2, currentMag * 10);
                return (
                  <g key={w.id}>
                    <line x1={ax} y1={ay} x2={bx} y2={by} stroke="rgba(250,202,21,0.95)" strokeWidth="4" strokeLinecap="round" />
                    {Array.from({ length: dots }).map((_, i) => {
                      const phase = ((tick * speedFactor) + (i * (len / dots))) % len;
                      const tpos = phase / len;
                      const px = ax + (bx - ax) * tpos;
                      const py = ay + (by - ay) * tpos;
                      return <circle key={i} cx={px} cy={py} r={2.2} fill="rgba(255,255,255,0.95)" />;
                    })}
                  </g>
                );
              })}

              {/* slots and components */}
              {SLOT_LAYOUT.map((s) => {
                const comp = placed.find((p) => p.slotId === s.id);
                return (
                  <g key={s.id}>
                    <rect x={s.x - 46} y={s.y - 28} width="92" height="56" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.03)" />
                    <text x={s.x} y={s.y - 36} fontSize="11" fill="rgba(255,255,255,0.6)" textAnchor="middle">{s.id}</text>

                    {comp ? (
                      <>
                        <rect x={s.x - 38} y={s.y - 20} width="76" height="40" rx="8" fill={comp.type === TYPES.BATTERY ? "#facc15" : comp.type === TYPES.RESISTOR ? "#60a5fa" : "#f472b6"} stroke="#000" />
                        <text x={s.x} y={s.y + 4} fontSize="12" fill="#000" fontWeight="700" textAnchor="middle">
                          {comp.type === TYPES.BATTERY ? `${comp.props.v?.toFixed(1) || 9} V` : comp.type === TYPES.RESISTOR ? `${comp.props.r || 10} Ω` : `LED`}
                        </text>

                        <circle cx={s.x - 38} cy={s.y} r="8" fill={connectingFrom && connectingFrom.slotId === s.id && connectingFrom.terminal === "L" ? "#60a5fa" : "#fff"} stroke="#000" onClick={() => onTerminalTapImpl(s.id, "L")} style={{ cursor: "pointer" }} />
                        <circle cx={s.x + 38} cy={s.y} r="8" fill={connectingFrom && connectingFrom.slotId === s.id && connectingFrom.terminal === "R" ? "#60a5fa" : "#fff"} stroke="#000" onClick={() => onTerminalTapImpl(s.id, "R")} style={{ cursor: "pointer" }} />

                        {comp.type === TYPES.RESISTOR && (
                          <foreignObject x={s.x - 36} y={s.y + 22} width="72" height="36">
                            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 12 }}>
                              <input type="range" min="1" max="200" value={comp.props.r} onChange={(e) => {
                                const val = Number(e.target.value);
                                setPlaced(prev => prev.map(p => p.slotId === s.id ? { ...p, props: { ...p.props, r: val } } : p));
                              }} style={{ width: "100%" }} />
                              <div style={{ fontSize: 11, textAlign: "center", color: "rgba(255,255,255,0.85)" }}>{comp.props.r} Ω</div>
                            </div>
                          </foreignObject>
                        )}

                        {comp.type === TYPES.BATTERY && (
                          <foreignObject x={s.x - 36} y={s.y + 22} width="72" height="36">
                            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 12 }}>
                              <input type="range" min="1" max="12" value={comp.props.v} onChange={(e) => {
                                const val = Number(e.target.value);
                                setPlaced(prev => prev.map(p => p.slotId === s.id ? { ...p, props: { ...p.props, v: val } } : p));
                              }} style={{ width: "100%" }} />
                              <div style={{ fontSize: 11, textAlign: "center", color: "rgba(255,255,255,0.85)" }}>{comp.props.v} V</div>
                            </div>
                          </foreignObject>
                        )}

                        {comp.type === TYPES.LED && (
                          <g>
                            <circle cx={s.x} cy={s.y} r={18} fill="yellow" opacity={Math.max(0.03, ledBrightness(comp))} />
                            <text x={s.x} y={s.y + 36} fontSize="11" fill="rgba(255,255,255,0.9)" textAnchor="middle">
                              I: {(solveResult.elementCurrents?.[comp.id] ?? 0).toFixed(4)} A
                            </text>
                          </g>
                        )}
                      </>
                    ) : (
                      <>
                        <rect x={s.x - 30} y={s.y - 16} width="60" height="32" rx="6" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.04)" onClick={() => placeComponentImpl(s.id, selectedTool)} style={{ cursor: "pointer" }} />
                        <text x={s.x} y={s.y + 4} fontSize="11" fill="rgba(255,255,255,0.6)" textAnchor="middle">Tap to place</text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* bottom actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => { setPlaced([]); setWires([]); setConnectingFrom(null); }} style={{ padding: 8, borderRadius: 8, background: "#ef4444", color: "#fff" }}>Clear All</button>
            <button onClick={() => setWires([])} style={{ padding: 8, borderRadius: 8, background: "#6b46c1", color: "#fff" }}>Clear Wires</button>
            <button onClick={autoWireDemo} style={{ padding: 8, borderRadius: 8, background: "#06b6d4", color: "#000" }}>Auto-wire Example</button>
            <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.8)" }}>
              Elements: {placed.length} • Wires: {wires.length} • Nodes: {solveResult.nodes?.length ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}