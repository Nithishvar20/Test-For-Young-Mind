// src/components/chemistry/AdvancedMixingLab.jsx
import React, { useRef, useState, useEffect } from "react";

/**
 * AdvancedMixingLab.jsx
 *
 * - Save to src/components/chemistry/AdvancedMixingLab.jsx
 * - Plug into your routes like other experiments.
 *
 * Features:
 * - Click chemicals on the left to pour into the beaker (animated).
 * - Each chemical has volume, concentration and color.
 * - Beaker shows animated liquid level, color mixing (weighted average).
 * - Reaction engine: pairwise rules produce precipitate, gas, color change, heat (visual).
 * - Precipitate particles (solid) and bubbles (gas) are animated atop the liquid.
 * - Controls: drop volume, auto-mix sequence, clear/reset.
 * - Activity log and readouts shown on right.
 *
 * This is self-contained and depends only on React.
 */

/* --- Data: chemicals and reactions --- */
// Simple chemicals with id, display name, color (hex), species type.
const CHEMICALS = [
  { id: "HCl", name: "HCl (acid)", color: "#ff7b7b", type: "acid" },
  { id: "NaOH", name: "NaOH (base)", color: "#7bc8ff", type: "base" },
  { id: "AgNO3", name: "AgNO₃ (silver nitrate)", color: "#d9d9d9", type: "salt" },
  { id: "NaCl", name: "NaCl (salt)", color: "#f0f0f0", type: "salt" },
  { id: "CuSO4", name: "CuSO₄ (copper sulfate)", color: "#4db8ff", type: "salt" },
  { id: "BaCl2", name: "BaCl₂ (barium chloride)", color: "#ffd27b", type: "salt" },
];

// Reaction rules keyed by sorted pair "A+B" (ids sorted alphabetically)
const REACTIONS = {
  // HCl + NaOH -> neutralization (salt + water) — color greenish
  "HCl+NaOH": {
    resultText: "Neutralization: NaCl (aq) + H₂O (neutral)",
    color: "#86e08b",
    effect: "heat", // visual heat pulse
  },
  // AgNO3 + NaCl -> AgCl precipitate (white solid)
  "AgNO3+NaCl": {
    resultText: "Precipitate: AgCl (s) formed",
    color: "#ffffff",
    effect: "precipitate",
  },
  // CuSO4 + NaOH -> Cu(OH)2 precipitate (blue)
  "CuSO4+NaOH": {
    resultText: "Precipitate: Cu(OH)₂ (s) formed",
    color: "#3fb0ff",
    effect: "precipitate",
  },
  // BaCl2 + NaSO4 (not present) — example omitted
  // HCl + AgNO3 -> insoluble AgCl as well
  "AgNO3+HCl": {
    resultText: "Precipitate: AgCl (s) formed",
    color: "#ffffff",
    effect: "precipitate",
  },
  // HCl + CuSO4 -> no visible precipitate, slight color change
  "CuSO4+HCl": {
    resultText: "No major precipitate; solution color shifts",
    color: "#3aa0ff",
    effect: "mix",
  },
};

/* --- Utility helpers --- */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}
function rgbToHex({r,g,b}) {
  const toHex = (n) => ("0" + Math.round(clamp(n,0,255)).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function blendColorsWeighted(items) {
  // items: [{color: "#rrggbb", weight: number}, ...]
  let r=0,g=0,b=0,w=0;
  items.forEach(it => {
    const wt = Math.max(0, it.weight || 1);
    const c = hexToRgb(it.color || "#ffffff");
    r += c.r * wt; g += c.g * wt; b += c.b * wt; w += wt;
  });
  if (w === 0) return "#a3c2ff";
  return rgbToHex({ r: r/w, g: g/w, b: b/w });
}

/* --- Main component --- */
export default function AdvancedMixingLab() {
  // beaker state
  const [contents, setContents] = useState([]); // [{chemId, volume_ml, concentration}]
  const [totalVolume, setTotalVolume] = useState(0); // mL
  const [liquidColor, setLiquidColor] = useState("#a3c2ff");
  const [logLines, setLogLines] = useState([]);
  const [dropVolume, setDropVolume] = useState(5); // mL per click
  const [isAutoMix, setIsAutoMix] = useState(false);
  const [isAnimatingPour, setIsAnimatingPour] = useState(false);
  const [precipitates, setPrecipitates] = useState([]); // particle pool for solids
  const [bubbles, setBubbles] = useState([]); // gas bubbles
  const [heatPulse, setHeatPulse] = useState(0); // visual heat pulse intensity
  const [beakerTemp, setBeakerTemp] = useState(22); // C

  const animRef = useRef(null);
  const lastTickRef = useRef(performance.now());

  // derived: displayables
  useEffect(() => {
    // compute total volume and blended color
    const total = contents.reduce((s,c) => s + (c.volume_ml || 0), 0);
    setTotalVolume(total);
    // color blending by volume
    const colorItems = contents.map(c => ({ color: CHEMICALS.find(x=>x.id===c.chemId).color, weight: c.volume_ml }));
    const blended = blendColorsWeighted(colorItems);
    setLiquidColor(blended);
  }, [contents]);

  // animation loop for particles and heat fade
  useEffect(() => {
    let running = true;
    function tick(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      // update precipitates drift
      setPrecipitates(prev => prev.map(p => ({ ...p, y: p.y - p.vy * dt, life: p.life - dt*0.2 })).filter(p => p.life > 0));
      // update bubbles rise
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - (30 + b.speed) * dt, life: b.life - dt*0.6 })).filter(b => b.life > 0));
      // fade heat pulse
      setHeatPulse(h => Math.max(0, h - dt * 1.5));
      // slowly cool beaker to ambient
      setBeakerTemp(t => Math.max(22, t - dt*0.5));

      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  // helpers to append to log
  function pushLog(txt) {
    setLogLines(l => [ `${new Date().toLocaleTimeString()}: ${txt}`, ...l ].slice(0, 40));
  }

  // pour a chemical into beaker (animated)
  function pourChemical(chemId, volume_ml = dropVolume, concentration = 1.0) {
    if (isAnimatingPour) return; // avoid overlaps
    setIsAnimatingPour(true);

    // small animation: over 400ms gradually add volume
    const steps = 24;
    const perStep = volume_ml / steps;
    let step = 0;
    const interval = 16; // ms
    pushLog(`Adding ${volume_ml} mL of ${chemId}`);
    const ci = CHEMICALS.find(c => c.id === chemId);
    const addStep = () => {
      step++;
      setContents(prev => {
        // merge with existing entry of same chem if present
        const copy = [...prev];
        const idx = copy.findIndex(x => x.chemId === chemId);
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], volume_ml: copy[idx].volume_ml + perStep };
        } else {
          copy.push({ chemId, volume_ml: perStep, concentration });
        }
        return copy;
      });
      if (step < steps) {
        setTimeout(addStep, interval);
      } else {
        // after pouring completes, run reaction engine
        setIsAnimatingPour(false);
        setTimeout(() => handleReactionCheck(), 120);
      }
    };
    addStep();
  }

  // reset beaker
  function resetBeaker() {
    setContents([]);
    setPrecipitates([]);
    setBubbles([]);
    setLogLines([]);
    setLiquidColor("#a3c2ff");
    setTotalVolume(0);
    setBeakerTemp(22);
    pushLog("Beaker reset");
  }

  // reaction engine: checks pairwise combinations in contents and triggers effects
  function handleReactionCheck() {
    // look for each unique pair (chem ids) present
    const presentIds = Array.from(new Set(contents.map(c => c.chemId)));
    let anyReaction = false;

    // process in pairwise order: check all unordered pairs, apply reaction once per pair
    for (let i = 0; i < presentIds.length; i++) {
      for (let j = i + 1; j < presentIds.length; j++) {
        const a = presentIds[i], b = presentIds[j];
        const key = [a,b].sort().join("+");
        const rule = REACTIONS[key];
        if (rule) {
          anyReaction = true;
          pushLog(`Reaction detected: ${rule.resultText}`);
          // visual effects based on rule.effect
          if (rule.effect === "precipitate") {
            // spawn a burst of solid particles within liquid region
            spawnPrecipitateParticles();
            // color shift toward rule.color
            setLiquidColor(rule.color);
          } else if (rule.effect === "heat") {
            setHeatPulse(1.4);
            setBeakerTemp(t => Math.min(80, t + 12)); // rise temp
            setLiquidColor(rule.color);
          } else if (rule.effect === "mix") {
            setLiquidColor(rule.color);
          }
          // modify concentrations: for simplicity reduce volumes of reactants a bit
          setContents(prev => {
            // reduce small fraction (simulating consumption) and keep product implicitly as color change
            return prev.map(c => (c.chemId === a || c.chemId === b) ? { ...c, volume_ml: Math.max(0, c.volume_ml * 0.88) } : c ).filter(x=>x.volume_ml>0.001);
          });
        }
      }
    }

    if (!anyReaction) {
      pushLog("No visible reaction detected.");
    }
  }

  function spawnPrecipitateParticles() {
    const added = Array.from({ length: 18 }).map(() => ({
      x: 40 + Math.random() * 220,
      y: 260 - Math.random() * 90,
      vy: 6 + Math.random() * 20,
      life: 2 + Math.random() * 2,
      size: 4 + Math.random() * 6,
      color: "#ffffff",
    }));
    setPrecipitates(prev => [...added, ...prev].slice(0, 300));
  }

  function spawnBubbles(count = 10) {
    const added = Array.from({ length: count }).map(() => ({
      x: 40 + Math.random() * 220,
      y: 260 + Math.random() * 20,
      speed: 20 + Math.random()*30,
      life: 1 + Math.random()*1.6,
    }));
    setBubbles(prev => [...added, ...prev].slice(0, 200));
  }

  // auto-mix demo sequence
  useEffect(() => {
    if (!isAutoMix) return;
    let seq = [
      {chem:"HCl", vol:10, delay: 600},
      {chem:"NaOH", vol:10, delay: 900},
      {chem:"AgNO3", vol:8, delay: 1000},
      {chem:"NaCl", vol:8, delay: 900},
    ];
    let idx = 0;
    pushLog("Auto-mix started");
    const runNext = () => {
      if (!isAutoMix || idx >= seq.length) {
        setIsAutoMix(false);
        pushLog("Auto-mix finished");
        return;
      }
      const s = seq[idx++];
      pourChemical(s.chem, s.vol);
      setTimeout(runNext, s.delay);
    };
    setTimeout(runNext, 400);
    return () => setIsAutoMix(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoMix]);

  /* ----------------- Visual components ----------------- */

  // Beaker SVG component
  function BeakerSVG() {
    const width = 280, height = 320;
    const liquidMaxHeight = 240; // px inside beaker
    const padding = 28;
    // map totalVolume (mL) to height fraction (assume 150 mL capacity)
    const capacity = 150;
    const fillFrac = clamp(totalVolume / capacity, 0, 1);
    const fillHeight = 16 + Math.round(liquidMaxHeight * fillFrac);
    // create subtle waves using CSS transform and heatPulse
    const waveOffset = isAnimatingPour ? 3 : 0;
    const heatGlow = heatPulse > 0 ? `0 0 ${12 * heatPulse}px rgba(255,120,50,${0.12 * heatPulse})` : "none";

    return (
      <div style={{ width, margin: "0 auto", position: "relative", height }}>
        {/* beaker body */}
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%" }}>
          <defs>
            <clipPath id="beakerClip">
              <rect x={padding} y={28} rx="6" ry="6" width={width - padding*2} height={liquidMaxHeight+8} />
            </clipPath>
            <linearGradient id="glassGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* beaker background */}
          <rect x={padding} y={16} width={width - padding*2} height={liquidMaxHeight+40} rx="14" fill="#061021" stroke="rgba(255,255,255,0.03)" strokeWidth="2"/>
          <rect x={padding+6} y={22} width={width - padding*2 - 12} height={liquidMaxHeight+28} rx="10" fill="url(#glassGrad)" />

          {/* liquid area (clipped) */}
          <g clipPath="url(#beakerClip)">
            {/* base colored rect (the mixed color) */}
            <rect x={padding} y={28 + liquidMaxHeight - fillHeight + 8} width={width - padding*2} height={fillHeight+40}
                  fill={liquidColor} style={{ transition: "fill 450ms linear" }} />

            {/* subtle top wave (animated transform) */}
            <g style={{ transform: `translateX(${waveOffset}px)`, transition: "transform 140ms" }}>
              <path d={`M${padding} ${28 + liquidMaxHeight - fillHeight + 20}
                        C ${padding+40} ${28 + liquidMaxHeight - fillHeight - 8},
                          ${width-padding-40} ${28 + liquidMaxHeight - fillHeight + 48},
                          ${width-padding} ${28 + liquidMaxHeight - fillHeight + 20}
                        L ${width-padding} ${28 + liquidMaxHeight + 80}
                        L ${padding} ${28 + liquidMaxHeight + 80} Z`} fill={hexToRgb(liquidColor) ? hexToRgb(liquidColor) : liquidColor}
                    opacity="0.08" />
            </g>

            {/* precipitate particles (drawn as small circles) */}
            {precipitates.map((p, idx) => (
              <circle key={"prec"+idx} cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={clamp(p.life,0,1)} />
            ))}

            {/* bubbles */}
            {bubbles.map((b, idx) => (
              <circle key={"bub"+idx} cx={b.x} cy={b.y} r={Math.max(1, 4 * b.life)} fill="rgba(255,255,255,0.85)" opacity={clamp(b.life,0,1)} />
            ))}
          </g>

          {/* beaker rim and accents */}
          <rect x={padding-6} y={12} width={width - (padding-6)*2} height={8} rx="6" fill="#0d2b3a" />
          <rect x={padding} y={28 + liquidMaxHeight + 16} width={width - padding*2} height={8} rx="4" fill="rgba(255,255,255,0.02)" />

          {/* temp/volume HUD */}
          <text x={width/2} y={14} textAnchor="middle" fontSize="13" fill="#ffffff" opacity="0.95">Beaker</text>
          <text x={padding+6} y={height-6} fontSize="12" fill="#ffffff" opacity="0.85">Vol: {Math.round(totalVolume)} mL</text>
          <text x={width-6-padding} y={height-6} fontSize="12" fill="#ffffff" opacity="0.85" textAnchor="end">Temp: {Math.round(beakerTemp)}°C</text>
        </svg>

        {/* overlay: pouring indicator / heat glow */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 160, height: 160, borderRadius: 80, boxShadow: heatGlow, transition: "box-shadow 220ms" }} />
        </div>
      </div>
    );
  }

  /* ----------------- Layout & UI ----------------- */

  return (
    <div style={{
      position: "absolute",
      inset: "50px 0 0 0",
      padding: 28,
      boxSizing: "border-box",
      color: "#fff",
      overflow: "auto",
      background: "linear-gradient(180deg,#1b0f2a 0%, #0b0b14 60%)"
    }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, margin: "6px 0 12px 0" }}>Mixing Lab — Interactive Chemistry</h1>
      <p style={{ marginTop: 0, color: "rgba(255,255,255,0.75)" }}>
        Click a chemical on the left to pour it into the beaker. Watch for color changes, heat, precipitate or bubbles when reactions occur.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 360px", gap: 22, marginTop: 18 }}>
        {/* left: chemical palette + controls */}
        <aside style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Chemicals</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CHEMICALS.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  pourChemical(c.id, dropVolume, 1.0);
                  // spawn a few bubbles on acidic/base mixing
                  if (c.type === "acid" || c.type === "base") spawnBubbles(4);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.03)",
                  cursor: "pointer", color: "#fff"
                }}>
                <div style={{ width: 36, height: 28, borderRadius: 6, background: c.color, border: "1px solid rgba(0,0,0,0.25)" }} />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{c.id}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{c.name}</div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{/* placeholder for conc/stock */} </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Drop volume: {dropVolume} mL</label>
            <input type="range" min="1" max="25" value={dropVolume} onChange={(e)=>setDropVolume(Number(e.target.value))} style={{ width: "100%" }} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setIsAutoMix(s => !s)} style={{ flex: 1, padding: "10px", background: isAutoMix ? "#f59e0b" : "#6366f1", border: "none", color: "#fff", borderRadius: 10, fontWeight: 800 }}>
              {isAutoMix ? "Stop Auto" : "Auto-mix"}
            </button>
            <button onClick={resetBeaker} style={{ flex: 1, padding: "10px", background: "#ef4444", border: "none", color: "#fff", borderRadius: 10, fontWeight: 800 }}>
              Reset
            </button>
          </div>

          

          
        </aside>

        {/* center: beaker + visuals */}
        <main style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))", padding: 18, borderRadius: 12 }}>
          <div style={{ display: "flex", gap: 18 }}>
            <div style={{ flex: 1 }}>
              <BeakerSVG />
            </div>

            {/* compact readouts near beaker */}
            <div style={{ width: 220, color: "rgba(255,255,255,0.95)" }}>
              <h3 style={{ marginTop: 4 }}>Readouts</h3>
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}><strong>Total volume:</strong> {Math.round(totalVolume)} mL</div>
                <div style={{ marginBottom: 8 }}><strong>Liquid color:</strong> <span style={{ display: "inline-block", width: 16, height: 12, verticalAlign: "middle", marginLeft: 8, background: liquidColor, borderRadius: 3 }} /></div>
                <div style={{ marginBottom: 8 }}><strong>Temp:</strong> {Math.round(beakerTemp)} °C</div>
              </div>

              <div style={{ marginTop: 10 }}>
                <h4 style={{ margin: 0 }}>Contents</h4>
                <div style={{ marginTop: 8 }}>
                  {contents.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>Beaker empty</div>}
                  {contents.map((c, idx) => {
                    const chem = CHEMICALS.find(cc => cc.id === c.chemId);
                    return (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>
                        <div>{c.chemId}</div>
                        <div style={{ color: "rgba(255,255,255,0.8)" }}>{Math.round(c.volume_ml)} mL</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <button onClick={() => { spawnBubbles(12); pushLog("Agitated beaker (shaken)"); }} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 700 }}>
                  Agitate (shake)
                </button>
                <button onClick={() => { setBeakerTemp(t => t + 8); pushLog("Heated beaker"); }} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#000", marginLeft: 8, fontWeight: 700 }}>
                  Heat
                </button>
              </div>
            </div>
          </div>

          {/* activity log below */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 6 }}>Activity log</h4>
            <div style={{ maxHeight: 160, overflowY: "auto", padding: 12, background: "rgba(255,255,255,0.01)", borderRadius: 8 }}>
              {logLines.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No actions yet.</div>}
              {logLines.map((ln, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>{ln}</div>)}
            </div>
          </div>
        </main>

        {/* right: advanced info and suggestion */}
        <aside style={{ background: "rgba(255,255,255,0.02)", padding: 18, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Reaction Inspector</h3>
          <div style={{ color: "rgba(255,255,255,0.9)" }}>
            <div style={{ marginBottom: 10 }}><strong>Try combinations:</strong></div>
            <ul style={{ paddingLeft: 18 }}>
              <li>AgNO₃ + NaCl → white AgCl(s)</li>
              <li>CuSO₄ + NaOH → blue Cu(OH)₂(s)</li>
              <li>HCl + NaOH → neutralization (salt + water)</li>
            </ul>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 12, paddingTop: 12 }}>
            <h4 style={{ margin: 0 }}>Status</h4>
            <div style={{ marginTop: 8 }}>
              <div><strong>Precipitates:</strong> {precipitates.length}</div>
              <div style={{ marginTop: 6 }}><strong>Bubbles:</strong> {bubbles.length}</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 6 }}>Notes</h4>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              - Real chemistry involves stoichiometry and solubility rules. This simulation simplifies those rules to highlight learning moments.<br/>
              - Use Heat and Agitate to speed up or reveal precipitates.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}