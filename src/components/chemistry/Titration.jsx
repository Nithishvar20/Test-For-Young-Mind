// src/components/chemistry/Titration.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Polished Titration UI
 * - Responsive beaker centered in left card
 * - Controls compacted on right (sliders smaller, labels clearer)
 * - Graph below controls
 * - Buttons under the beaker (Add Drop / Auto / Reset)
 * - 3cm bottom padding for page
 *
 * Behavior remains the same as before.
 */

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function pHtoColor(pH) {
  const p = clamp(pH, 0, 14);
  if (p <= 4) {
    const t = p / 4;
    const r = 255;
    const g = Math.round(60 + 140 * t);
    const b = Math.round(40 + 40 * t);
    return `rgb(${r},${g},${b})`;
  } else if (p <= 10) {
    const t = (p - 4) / 6;
    const r = Math.round(255 - 200 * t);
    const g = Math.round(200 + 55 * t);
    const b = Math.round(60 + 140 * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (p - 10) / 4;
    const r = Math.round(55 - 20 * t);
    const g = Math.round(255 - 80 * t);
    const b = Math.round(200 + 55 * t);
    return `rgb(${r},${g},${b})`;
  }
}

export default function Titration() {
  // UI state & controls
  const [beakerVolMl, setBeakerVolMl] = useState(25);
  const [acidConc, setAcidConc] = useState(0.08);
  const [baseConc, setBaseConc] = useState(0.09);
  const [dropVolumeMl, setDropVolumeMl] = useState(1.0);

  const [dropCount, setDropCount] = useState(0);
  const [addedVolumeMl, setAddedVolumeMl] = useState(0);
  const [history, setHistory] = useState([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoRef = useRef(null);

  // drop animation
  const [drops, setDrops] = useState([]);
  const dropId = useRef(0);

  // graph canvas
  const graphRef = useRef(null);

  // physics helpers
  function computeState(volAcidMl, concAcid, volBaseAddedMl, concBase) {
    const Va = volAcidMl / 1000;
    const Vb = volBaseAddedMl / 1000;
    const na = Va * concAcid;
    const nb = Vb * concBase;
    const totalV = Va + Vb || 1e-12;
    const net = na - nb;
    let pH = 7.0;
    if (Math.abs(net) < 1e-12) pH = 7;
    else if (net > 0) {
      const H = net / totalV; pH = -Math.log10(H);
    } else {
      const OH = Math.abs(net) / totalV;
      pH = 14 - (-Math.log10(OH));
    }
    return { pH, na, nb, totalV, net, equivalenceVolMl: (na / concBase) * 1000 };
  }

  const sim = computeState(beakerVolMl, acidConc, addedVolumeMl, baseConc);
  const pH = sim.pH;
  const eqVol = sim.equivalenceVolMl;

  function fmt(v, digits = 2) {
    if (Math.abs(v) >= 1000) return v.toFixed(0);
    return Number(v).toFixed(digits);
  }

  // add drop
  function addDrop() {
    const newAdded = +(addedVolumeMl + dropVolumeMl).toFixed(6);
    setAddedVolumeMl(newAdded);
    setDropCount(c => c + 1);

    const s = computeState(beakerVolMl, acidConc, newAdded, baseConc);
    setHistory(h => {
      const next = [...h, { vol: newAdded, pH: s.pH }];
      if (next.length > 2000) next.shift();
      return next;
    });

    // spawn drop animation approx centered over beaker neck
    const id = dropId.current++;
    // left offset tuned to beaker area; will be adjusted by CSS responsiveness
    const left = 140 + Math.random() * 140;
    setDrops(ds => ds.concat({ id, left }));
    setTimeout(() => setDrops(ds => ds.filter(d => d.id !== id)), 900);
  }

  function resetAll() {
    setAddedVolumeMl(0);
    setDropCount(0);
    setHistory([]);
    setAutoRunning(false);
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
  }

  // auto titrate
  useEffect(() => {
    if (!autoRunning) {
      if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
      return;
    }
    autoRef.current = setInterval(() => {
      if (addedVolumeMl > Math.max(eqVol + 5, eqVol * 1.5) || addedVolumeMl > 200) {
        setAutoRunning(false);
        clearInterval(autoRef.current);
        autoRef.current = null;
        return;
      }
      addDrop();
    }, 220);
    return () => { if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunning, addedVolumeMl, beakerVolMl, acidConc, baseConc, dropVolumeMl]);

  // initial sample
  useEffect(() => {
    if (history.length === 0 && addedVolumeMl === 0) {
      const s = computeState(beakerVolMl, acidConc, 0, baseConc);
      setHistory([{ vol: 0, pH: s.pH }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // draw graph
  useEffect(() => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function draw() {
      const parentW = canvas.parentElement.clientWidth;
      const w = canvas.width = parentW;
      const h = canvas.height = 260;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#081426";
      ctx.fillRect(0, 0, w, h);

      // grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const vSteps = 6;
      for (let i = 0; i <= vSteps; i++) {
        const x = (i / vSteps) * w;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      if (!history || history.length === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.font = "13px Inter, system-ui, sans-serif";
        ctx.fillText("Add drops to build the titration curve", 12, h / 2);
        return;
      }

      const vols = history.map(p => p.vol);
      const maxHistVol = Math.max(...vols, addedVolumeMl);
      const xMax = Math.max(eqVol * 1.3, maxHistVol * 1.2, eqVol + 10, 10);
      const pMin = 0;
      const pMax = 14;

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.fillText("pH", 8, 14);
      ctx.fillText("0 mL", 10, h - 6);
      ctx.fillText(`${Math.round(xMax)} mL`, w - 60, h - 6);

      // curve
      ctx.beginPath();
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = "#60a5fa";
      history.forEach((pt, i) => {
        const x = (pt.vol / xMax) * (w - 40) + 20;
        const y = h - ((pt.pH - pMin) / (pMax - pMin)) * (h - 30) - 10;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // last point
      const last = history[history.length - 1];
      const lx = (last.vol / xMax) * (w - 40) + 20;
      const ly = h - ((last.pH - pMin) / (pMax - pMin)) * (h - 30) - 10;
      ctx.beginPath();
      ctx.fillStyle = "#fb7185";
      ctx.arc(lx, ly, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // eq marker
      const eqX = (eqVol / xMax) * (w - 40) + 20;
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(eqX, 8);
      ctx.lineTo(eqX, h - 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("Eq", eqX + 6, 18);
    }

    draw();
    const obs = new ResizeObserver(draw);
    obs.observe(canvas.parentElement);
    return () => obs.disconnect();
  }, [history, addedVolumeMl, eqVol]);

  // page layout styles
  const container = {
    paddingTop: 88,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: "3cm",
    color: "#fff",
    boxSizing: "border-box",
    minHeight: "100vh",
    background: "linear-gradient(180deg,#1b0d2a,#071427 40%)",
  };

  const title = { textAlign: "center", fontSize: 34, marginBottom: 6, fontWeight: 800 };
  const subtitle = { textAlign: "center", color: "rgba(255,255,255,0.75)", marginTop: 0, marginBottom: 18 };

  const leftCard = {
    background: "linear-gradient(180deg,#071428,#081726)",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  };

  const rightCard = {
    background: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
  };

  const smallSlider = { width: "100%", height: 6, appearance: "none", background: "linear-gradient(90deg,#213247,#0f2430)", borderRadius: 6, outline: "none" };

  return (
    <div style={container}>
      <h1 style={title}>Virtual Titration — Strong Acid / Strong Base</h1>
      <p style={subtitle}>Add drops of base to neutralize the acid. Watch the pH and the titration curve.</p>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
        {/* Left: Beaker + actions + readouts */}
        <div style={{ flex: 1 }}>
          <div style={leftCard}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              {/* beaker area */}
              <div style={{ flex: 1, minWidth: 360 }}>
                <div style={{ position: "relative", width: "100%", height: 320, borderRadius: 10, overflow: "hidden", background: "#071a24", boxShadow: "inset 0 6px 40px rgba(0,0,0,0.6)" }}>
                  {/* SVG beaker (responsive) */}
                  <svg viewBox="0 0 420 320" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="liquidGradA" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={pHtoColor(pH)} stopOpacity="0.96" />
                        <stop offset="100%" stopColor="#061826" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>

                    {/* beaker body */}
                    <rect x="110" y="40" rx="12" ry="12" width="200" height="240" fill="#041623" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* liquid fill (procedural) */}
                    {(() => {
                      const currentTotalMl = beakerVolMl + addedVolumeMl;
                      const liquidMaxMl = beakerVolMl + Math.max(40, eqVol * 1.2);
                      const fillRatio = clamp(currentTotalMl / liquidMaxMl, 0, 0.98);
                      const bodyHeight = 240;
                      const fillHeightPx = bodyHeight * fillRatio;
                      const surfaceY = 40 + (bodyHeight - fillHeightPx);
                      const waveAmp = 6;
                      const wave = (x) => {
                        const t = x / 200;
                        return surfaceY + Math.sin(t * Math.PI * 6 + (addedVolumeMl * 0.2)) * (waveAmp * (0.25 + 0.75 * (1 - fillRatio)));
                      };
                      const steps = 44;
                      let path = `M 110 ${40 + bodyHeight} L 110 ${wave(0)} `;
                      for (let i = 0; i <= steps; i++) {
                        const x = 110 + (i / steps) * 200;
                        path += `L ${x} ${wave(i / steps * 200)} `;
                      }
                      path += `L 310 ${40 + bodyHeight} Z`;
                      return (
                        <>
                          <path d={path} fill="url(#liquidGradA)" />
                          <ellipse cx={210} cy={surfaceY - 8} rx={56} ry={10} fill="rgba(255,255,255,0.03)" />
                        </>
                      );
                    })()}

                    {/* floating pH badge */}
                    <g>
                      <circle cx={210} cy={160} r={44} fill={pHtoColor(pH)} opacity={0.98} />
                      <text x={210} y={164} textAnchor="middle" fontWeight="800" fontSize="18" fill="#041825" >
                        pH {fmt(pH, 2)}
                      </text>
                    </g>
                  </svg>

                  {/* Drop animation elements: absolutely positioned */}
                  {drops.map(d => (
                    <div
                      key={d.id}
                      style={{
                        position: "absolute",
                        left: `${d.left}px`,
                        top: 8,
                        width: 10,
                        height: 16,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.95)",
                        transform: "translateY(0)",
                        animation: "dropFall 0.9s ease-in forwards",
                        filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))",
                      }}
                    />
                  ))}
                </div>

                {/* status line */}
                <div style={{ marginTop: 12, color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                  Volume added: <strong>{fmt(addedVolumeMl, 2)} mL</strong> ({dropCount} drops)
                  <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.45)" }}>•</span>
                  Expected equivalence: <strong>{fmt(eqVol, 2)} mL</strong>
                </div>

                {/* actions */}
                <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button onClick={addDrop} style={primaryBtn}>Add Drop</button>
                  <button onClick={() => setAutoRunning(r => !r)} style={autoRunning ? stopBtn : successBtn}>
                    {autoRunning ? "Stop" : "Auto Titrate"}
                  </button>
                  <button onClick={resetAll} style={mutedBtn}>Reset</button>

                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Drop vol</label>
                    <input type="range" min={0.1} max={2.5} step={0.1} value={dropVolumeMl} onChange={(e) => setDropVolumeMl(Number(e.target.value))} style={smallSlider} />
                    <div style={{ width: 56, textAlign: "right", color: "rgba(255,255,255,0.9)" }}>{fmt(dropVolumeMl, 2)} mL</div>
                  </div>
                </div>
              </div>

              {/* condensed readouts on the right of the beaker */}
              <div style={{ width: 300 }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Readouts</div>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>pH: <strong>{fmt(pH, 2)}</strong></div>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Volume added: <strong>{fmt(addedVolumeMl, 2)} mL</strong></div>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>Drops: <strong>{dropCount}</strong></div>

                  <hr style={{ opacity: 0.06, margin: "10px 0" }} />
                  <div style={{ fontWeight: 800 }}>Simulation</div>
                  <div style={{ marginTop: 6, fontSize: 13 }}>Moles acid: <strong>{sim.na.toExponential(3)}</strong></div>
                  <div style={{ fontSize: 13 }}>Equiv. vol (calc): <strong>{fmt(eqVol, 2)} mL</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Controls + graph */}
        <aside style={{ width: 380 }}>
          <div style={rightCard}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 12 }}>Controls</div>

            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>Beaker volume: <strong>{fmt(beakerVolMl,0)} mL</strong></div>
              <input type="range" min={5} max={100} step={1} value={beakerVolMl} onChange={(e) => setBeakerVolMl(Number(e.target.value))} style={smallSlider} />

              <div style={{ fontSize: 14 }}>Acid conc (HCl): <strong>{fmt(acidConc, 3)} M</strong></div>
              <input type="range" min={0.01} max={0.5} step={0.005} value={acidConc} onChange={(e) => setAcidConc(Number(e.target.value))} style={smallSlider} />

              <div style={{ fontSize: 14 }}>Base conc (NaOH): <strong>{fmt(baseConc, 3)} M</strong></div>
              <input type="range" min={0.01} max={0.5} step={0.005} value={baseConc} onChange={(e) => setBaseConc(Number(e.target.value))} style={smallSlider} />
            </div>

            <hr style={{ border: "none", height: 1, background: "rgba(255,255,255,0.06)", margin: "14px 0" }} />

            <div style={{ fontWeight: 900, marginBottom: 10 }}>Titration Curve</div>
            <div style={{ borderRadius: 8, overflow: "hidden", background: "#071922", padding: 8 }}>
              <canvas ref={graphRef} style={{ width: "100%", height: 260, display: "block", borderRadius: 6 }} />
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        /* Buttons */
        .btn-base { border-radius: 10px; padding: 10px 14px; font-weight: 800; cursor: pointer; border: none; }
      `}</style>

      <style>{`
        @keyframes dropFall {
          0% { transform: translateY(0); opacity: 1; }
          60% { transform: translateY(60px); opacity: 1; }
          100% { transform: translateY(200px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* Inline button styles (outside main component to keep markup clean) */
const primaryBtn = {
  borderRadius: 10, padding: "10px 14px", background: "#fb6b3b", color: "#fff",
  fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 6px 18px rgba(251,107,59,0.18)"
};
const successBtn = {
  borderRadius: 10, padding: "10px 14px", background: "#10b981", color: "#fff",
  fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 6px 18px rgba(16,185,129,0.12)"
};
const stopBtn = {
  borderRadius: 10, padding: "10px 14px", background: "#ef4444", color: "#fff",
  fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 6px 18px rgba(239,68,68,0.12)"
};
const mutedBtn = {
  borderRadius: 10, padding: "10px 14px", background: "#374151", color: "#fff",
  fontWeight: 700, border: "none", cursor: "pointer"
};
const smallSlider = {
  width: "100%",
  appearance: "none",
  height: 6,
  borderRadius: 6,
  background: "linear-gradient(90deg,#213247,#0f2430)",
  outline: "none",
};