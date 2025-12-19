// src/components/physics/SpringMassPro.jsx
import React, { useRef, useEffect, useState } from "react";

/**
 * SpringMassPro.jsx
 * - Replaces the simple spring demo with a polished "Pro" board similar to PendulumPro.
 * - RK4 integration of mass-spring-damper with optional harmonic driving.
 * - Canvas visualization: wall, animated spring coil, mass block with shadow.
 * - Right-side measurement card & history; top HUD; bottom control panel.
 * - Internal plotting (displacement vs time, energy) drawn to canvas.
 *
 * Paste into src/components/physics/SpringMassPro.jsx or replace your current SpringMass.jsx.
 */

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export default function SpringMassPro() {
  const TOPBAR_HEIGHT = 72; // match your TopBar height

  // --- Simulation parameters (user controls)
  const [mass, setMass] = useState(1.0); // kg
  const [k, setK] = useState(20.0); // N/m spring constant
  const [damping, setDamping] = useState(0.5); // N·s/m
  const [x0, setX0] = useState(-0.4); // m, initial displacement relative to equilibrium
  const [v0, setV0] = useState(0.0); // m/s initial velocity
  const [driveAmp, setDriveAmp] = useState(0.0); // N
  const [driveFreq, setDriveFreq] = useState(2.0); // rad/s
  const [dt, setDt] = useState(0.012); // integrator step
  const [timeScale, setTimeScale] = useState(1.0);
  const [running, setRunning] = useState(false);
  const [showTrail, setShowTrail] = useState(true);

  // internal state refs
  const stateRef = useRef({ t: 0, x: x0, v: v0 });
  const rafRef = useRef(null);
  const lastRAFTime = useRef(null);
  const canvasRef = useRef(null);

  // history (for plots & energy)
  const [history, setHistory] = useState([]);
  const maxHistory = 4000;

  // derived analytic values
  const omega0 = Math.sqrt(k / mass); // natural angular frequency
  const freq0 = omega0 / (2 * Math.PI);
  const zeta = damping / (2 * Math.sqrt(k * mass)); // damping ratio
  const wn_damped = omega0 * Math.sqrt(Math.max(0, 1 - zeta * zeta));

  // helpers: energy
  function energy(x, v) {
    const KE = 0.5 * mass * v * v;
    const PE = 0.5 * k * x * x;
    return { KE, PE, E: KE + PE };
  }

  // ODE: dx/dt = v, dv/dt = -(k/m) x - (c/m) v + Fdrive/m
  function derivs(s, t) {
    const Fdrive = driveAmp * Math.sin(driveFreq * t);
    const ax = ( -k * s.x - damping * s.v + Fdrive ) / mass;
    return { xdot: s.v, vdot: ax };
  }

  // RK4 step
  function rk4Step(s, t, h) {
    const k1 = derivs(s, t);
    const s2 = { x: s.x + 0.5 * h * k1.xdot, v: s.v + 0.5 * h * k1.vdot };
    const k2 = derivs(s2, t + 0.5 * h);
    const s3 = { x: s.x + 0.5 * h * k2.xdot, v: s.v + 0.5 * h * k2.vdot };
    const k3 = derivs(s3, t + 0.5 * h);
    const s4 = { x: s.x + h * k3.xdot, v: s.v + h * k3.vdot };
    const k4 = derivs(s4, t + h);
    const xN = s.x + (h/6) * (k1.xdot + 2*k2.xdot + 2*k3.xdot + k4.xdot);
    const vN = s.v + (h/6) * (k1.vdot + 2*k2.vdot + 2*k3.vdot + k4.vdot);
    return { x: xN, v: vN };
  }

  // reset sim
  function reset(simState = {}) {
    const x = simState.x ?? x0;
    const v = simState.v ?? v0;
    stateRef.current = { t: 0, x, v };
    setHistory([{ t: 0, x, v, ...energy(x, v) }]);
  }

  // init
  useEffect(() => {
    reset({ x: x0, v: v0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function resize() {
      const availW = Math.max(720, Math.min(window.innerWidth * 0.68, 1300));
      const availH = Math.max(420, Math.min(window.innerHeight - TOPBAR_HEIGHT - 220, 900));
      canvas.width = Math.floor(availW);
      canvas.height = Math.floor(availH);
      draw();
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mass, k, damping, showTrail, driveAmp, driveFreq]);

  // RAF integration loop
  useEffect(() => {
    function loop(now) {
      if (!lastRAFTime.current) lastRAFTime.current = now;
      const elapsedMS = now - lastRAFTime.current;
      lastRAFTime.current = now;

      const scaled = (elapsedMS / 1000) * timeScale;
      if (running && scaled > 1e-9) {
        let rem = scaled;
        const maxChunk = 0.05;
        if (rem > 0.25) rem = 0.25;
        while (rem > 1e-9) {
          const h = Math.min(dt, rem, maxChunk);
          const cur = stateRef.current;
          const nxt = rk4Step({ x: cur.x, v: cur.v }, cur.t, h);
          const tNext = cur.t + h;
          stateRef.current = { t: tNext, x: nxt.x, v: nxt.v };
          rem -= h;
        }
        setHistory((harr) => {
          const st = stateRef.current;
          const e = energy(st.x, st.v);
          const next = harr.concat({ t: st.t, x: st.x, v: st.v, ...e });
          if (next.length > maxHistory) next.shift();
          return next;
        });
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, dt, timeScale, driveAmp, driveFreq, damping, mass, k]);

  // draw visuals inside a board; canvas-only content
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // clear
    ctx.clearRect(0, 0, W, H);

    // card background is DOM; canvas interior should be slightly darker
    ctx.fillStyle = "#071122";
    ctx.fillRect(0, 0, W, H);

    // spring board geometry
    const leftMargin = Math.floor(W * 0.06);
    const rightMargin = Math.floor(W * 0.06);
    const boardW = W - leftMargin - rightMargin;
    const boardH = H - 22;
    const boardX = leftMargin;
    const boardY = 8;

    // drawing area inside board (for spring)
    const wallX = boardX + 32; // wall point
    const springStartX = wallX + 8;
    const massAreaX = boardX + Math.floor(boardW * 0.15);
    const massAreaW = Math.floor(boardW * 0.6);
    const massY = Math.floor(boardY + boardH * 0.45);

    // draw subtle inner rectangle (canvas background is dark, but add inset)
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    roundRect(ctx, boardX, boardY, boardW, boardH, 12);
    ctx.fill();

    // simulate mapping from x (meters) to px within massArea
    const pxPerMeter = Math.max(80, Math.min(210, (massAreaW - 120) / 1.6)); // scale
    const eqX = massAreaX + Math.floor(massAreaW / 2); // equilibrium pixel center
    const cur = stateRef.current;
    const bobX = eqX + cur.x * pxPerMeter; // mass center pixel

    // draw wall
    ctx.fillStyle = "#0b1228";
    ctx.fillRect(wallX - 12, boardY + 12, 16, boardH - 24);
    // wall hatch
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let y = boardY + 20; y < boardY + boardH - 20; y += 10) {
      ctx.beginPath();
      ctx.moveTo(wallX - 12 + 2, y);
      ctx.lineTo(wallX - 12 + 12, y + 6);
      ctx.stroke();
    }

    // draw spring as coil: from springStartX to left edge of mass
    const massLeft = bobX - 42;
    drawSpring(ctx, springStartX, massLeft, massY, 14, 8, "#60a5fa");

    // draw connection plate on mass
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(massLeft - 6, massY - 40, 12, 80);

    // draw mass block (rounded)
    const massW = 84;
    const massH = 64;
    roundRect(ctx, bobX - massW/2, massY - massH/2, massW, massH, 8);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();

    // mass shadow
    const shadowGrad = ctx.createRadialGradient(bobX, massY + massH/2 + 6, 1, bobX, massY + massH/2 + 6, massW);
    shadowGrad.addColorStop(0, "rgba(0,0,0,0.45)");
    shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(bobX, massY + massH/2 + 12, massW * 0.6, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // small indicator equilibrium line
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(eqX, boardY + 12);
    ctx.lineTo(eqX, boardY + boardH - 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // draw small ruler / px markers to indicate scale
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.font = "12px Inter, system-ui, Arial";
    ctx.fillText("0 m", eqX - 14, massY - massH/2 - 12);
    ctx.fillText(" +1 m", eqX + pxPerMeter - 22, massY - massH/2 - 12);
    ctx.fillText(" -1 m", eqX - pxPerMeter - 24, massY - massH/2 - 12);

    // draw simple mini plots on right inside board
    const plotW = Math.min(380, Math.floor(boardW * 0.36));
    const plotH = Math.floor(boardH * 0.36);
    const plotX = boardX + boardW - plotW - 18;
    const plotY = boardY + 12;

    // plot background
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    roundRect(ctx, plotX, plotY, plotW, plotH, 8);
    ctx.fill();

    // displacement vs time
    const pts = history.slice(-Math.floor(plotW));
    if (pts.length > 2) {
      const t0 = pts[0].t;
      const t1 = pts[pts.length - 1].t || (t0 + 1);
      const dtPlot = Math.max(1e-6, t1 - t0);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const x = plotX + 6 + ((p.t - t0) / dtPlot) * (plotW - 12);
        const y = plotY + plotH/2 - (p.x * pxPerMeter) * (plotH/2 - 8) / (pxPerMeter * 1.6); // normalize
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // energy inset below
    const insetW = plotW;
    const insetH = Math.floor(boardH * 0.2);
    const insetX = plotX;
    const insetY = plotY + plotH + 12;
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    roundRect(ctx, insetX, insetY, insetW, insetH, 8);
    ctx.fill();

    const epts = history.slice(-Math.floor(insetW));
    if (epts.length > 2) {
      const t0 = epts[0].t;
      const t1 = epts[epts.length - 1].t || (t0 + 1);
      const dtPlot = Math.max(1e-6, t1 - t0);
      // total energy
      ctx.beginPath();
      for (let i = 0; i < epts.length; i++) {
        const p = epts[i];
        const x = insetX + 6 + ((p.t - t0) / dtPlot) * (insetW - 12);
        const maxE = Math.max(...epts.map(z => z.E), 1e-6);
        const y = insetY + insetH - (p.E / maxE) * (insetH - 12);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#fb7185"; // pinkish for total E
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // HUD label inside top-left of board (very small)
    ctx.font = "13px Inter, system-ui, Arial";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const curT = stateRef.current.t;
    const curX = stateRef.current.x;
    const curV = stateRef.current.v;
    const en = energy(curX, curV);
    ctx.fillText(`t = ${curT.toFixed(2)} s`, boardX + 14, boardY + 28);
    ctx.fillText(`x = ${curX.toFixed(2)} m`, boardX + 14, boardY + 48);
    ctx.fillText(`v = ${curV.toFixed(2)} m/s`, boardX + 14, boardY + 68);
    ctx.fillText(`KE = ${en.KE.toFixed(2)} J, PE = ${en.PE.toFixed(2)} J`, boardX + 14, boardY + 88);

    // optional trail (tiny dots behind mass center)
    if (showTrail && history.length > 6) {
      const trail = history.slice(-120);
      for (let i = 0; i < trail.length; i+=4) {
        const p = trail[i];
        const xpx = eqXFrom(boardX, boardW) + p.x * pxPerMeter;
        const ypx = massY + massH/2 + 6;
        ctx.fillStyle = `rgba(99,102,241,${0.05 + (i / trail.length) * 0.6})`;
        ctx.fillRect(xpx - 2, ypx - 2, 4, 4);
      }
    }
  }

  // helper to get equilibrium pixel x (same formula used earlier)
  function eqXFrom(boardX, boardW) {
    return boardX + Math.floor(boardW * 0.15) + Math.floor((boardW * 0.6) / 2);
  }

  // draw spring using simple sinusoidal coil between two x positions at a given y
  function drawSpring(ctx, x0, x1, y, coils = 12, amp = 8, color = "#60a5fa") {
    const L = Math.max(10, x1 - x0);
    const n = Math.max(6, Math.floor((coils * L) / 120));
    ctx.beginPath();
    ctx.moveTo(x0, y);
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const xp = x0 + t * (x1 - x0);
      const phase = t * Math.PI * coils;
      const yp = y + Math.sin(phase) * amp * Math.sin((1 - t) * Math.PI * 0.5); // taper
      ctx.lineTo(xp, yp);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // small rounded rect helper
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // controls
  function toggleRun() {
    setRunning((r) => {
      const next = !r;
      if (next) lastRAFTime.current = null;
      return next;
    });
  }

  function stepSim() {
    const cur = stateRef.current;
    const nxt = rk4Step({ x: cur.x, v: cur.v }, cur.t, dt);
    stateRef.current = { t: cur.t + dt, x: nxt.x, v: nxt.v };
    setHistory((harr) => {
      const st = stateRef.current;
      const e = energy(st.x, st.v);
      const n = harr.concat({ t: st.t, x: st.x, v: st.v, ...e });
      if (n.length > maxHistory) n.shift();
      return n;
    });
    draw();
  }

  function resetSim() {
    setRunning(false);
    reset({ x: x0, v: v0 });
  }

  // sync parameters while stopped: if user changes initial x/v and simulation is not running
  useEffect(() => {
    if (!running) {
      stateRef.current.x = x0;
      stateRef.current.v = v0;
      setHistory([{ t: 0, x: x0, v: v0, ...energy(x0, v0) }]);
      draw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x0, v0, mass, k, damping]);

  // derived for DOM HUD
  const cur = stateRef.current;
  const last = history.length ? history[history.length - 1] : null;

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.code === "Space") {
        e.preventDefault();
        toggleRun();
      } else if (e.key.toLowerCase() === "r") {
        resetSim();
      } else if (e.key.toLowerCase() === "p") {
        setRunning(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Render UI (board, HUD, controls, right measurements)
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        color: "#fff",
        background: "linear-gradient(180deg,#0b1220,#1b0922)",
        padding: 18,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Spring–Mass Oscillator</h2>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 6 }}>
          Advanced oscillator with damping and driving. Compare analytic & simulated behavior.
        </div>
      </div>

      {/* HUD row */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginBottom: 12, fontSize: 13 }}>
        <div>t: {cur.t.toFixed(2)} s</div>
        <div>x: {cur.x.toFixed(2)} m</div>
        <div>v: {cur.v.toFixed(2)} m/s</div>
        <div>KE: {last ? last.KE.toFixed(2) : "—"} J</div>
        <div>PE: {last ? last.PE.toFixed(2) : "—"} J</div>
        <div>Total: {last ? last.E.toFixed(2) : "—"} J</div>
        <div>ω₀: {omega0.toFixed(2)} rad/s</div>
        <div>ζ: {zeta.toFixed(3)}</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={toggleRun} style={buttonStyle}>{running ? "Pause (P)" : "Run (Space)"}</button>
          <button onClick={stepSim} style={mutedButton}>Step</button>
          <button onClick={resetSim} style={dangerButton}>Reset</button>
        </div>
      </div>

      {/* Main board + right column */}
      <div style={{ display: "flex", gap: 18, height: "calc(100% - 170px)" }}>
        {/* Board card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "linear-gradient(145deg,#0f1724,#111827)",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(2,6,23,0.6), inset 0 4px 18px rgba(255,255,255,0.02)",
            padding: 16,
          }}
        >
          <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", background: "#071022" }}>
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
          </div>

          {/* control strip */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={controlBox}>
              <label style={labelStyle}>Mass: {mass.toFixed(2)}</label>
              <input type="range" min={0.1} max={8} step={0.01} value={mass} onChange={(e)=>setMass(Number(e.target.value))} />
            </div>

            <div style={controlBox}>
              <label style={labelStyle}>k (N/m): {k.toFixed(1)}</label>
              <input type="range" min={1} max={200} step={0.1} value={k} onChange={(e)=>setK(Number(e.target.value))} />
            </div>

            <div style={controlBox}>
              <label style={labelStyle}>Damping: {damping.toFixed(2)}</label>
              <input type="range" min={0} max={6} step={0.01} value={damping} onChange={(e)=>setDamping(Number(e.target.value))} />
            </div>

            <div style={{ ...controlBox, minWidth: 220 }}>
              <label style={labelStyle}>Initial x: {x0.toFixed(2)} m</label>
              <input type="range" min={-1.5} max={1.5} step={0.01} value={x0} onChange={(e)=>setX0(Number(e.target.value))} />
            </div>

            <div style={{ ...controlBox, minWidth: 220 }}>
              <label style={labelStyle}>Initial v: {v0.toFixed(2)} m/s</label>
              <input type="range" min={-6} max={6} step={0.01} value={v0} onChange={(e)=>setV0(Number(e.target.value))} />
            </div>

            <div style={{ ...controlBox, minWidth: 260 }}>
              <label style={labelStyle}>Drive amp: {driveAmp.toFixed(2)} N</label>
              <input type="range" min={0} max={20} step={0.1} value={driveAmp} onChange={(e)=>setDriveAmp(Number(e.target.value))} />
              <label style={{...labelStyle, marginTop:6}}>Drive freq: {driveFreq.toFixed(2)} rad/s</label>
              <input type="range" min={0.2} max={10} step={0.01} value={driveFreq} onChange={(e)=>setDriveFreq(Number(e.target.value))} />
            </div>

            <div style={controlBox}>
              <label style={labelStyle}>Time step dt: {dt}s</label>
              <input type="range" min={0.002} max={0.04} step={0.001} value={dt} onChange={(e)=>setDt(Number(e.target.value))} />
            </div>

            <div style={controlBox}>
              <label style={labelStyle}>Time scale: {timeScale.toFixed(2)}x</label>
              <input type="range" min={0.1} max={3} step={0.05} value={timeScale} onChange={(e)=>setTimeScale(Number(e.target.value))} />
            </div>

            
          </div>
        </div>

        {/* right column measurement card */}
        <aside style={{ width: 320 }}>
          <div style={{ background: "rgba(17,24,39,0.95)", borderRadius: 16, padding: 16, height: "100%", boxSizing: "border-box", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Measurements</div>
            <div style={{ marginTop: 6 }}>Displacement: {cur.x.toFixed(3)} m</div>
            <div>Velocity: {cur.v.toFixed(3)} m/s</div>
            <div>Natural ω₀: {omega0.toFixed(3)} rad/s</div>
            <div>Natural f₀: {freq0.toFixed(3)} Hz</div>
            <div>Damping ratio ζ: {zeta.toFixed(3)}</div>

            <div style={{ marginTop: 8, fontWeight: 700 }}>Energy (J):</div>
            <div style={{ marginTop: 4 }}>
              <div>KE: {last ? last.KE.toFixed(3) : "—"}</div>
              <div>PE: {last ? last.PE.toFixed(3) : "—"}</div>
              <div>Total: {last ? last.E.toFixed(3) : "—"}</div>
            </div>

            <hr style={{ border: "none", height: 1, background: "rgba(255,255,255,0.04)", margin: "10px 0" }} />

            <div style={{ fontWeight: 800 }}>History (last values)</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 8, height: 220, overflow: "auto" }}>
              {history.slice(-30).reverse().map((h, idx) => (
                <div key={idx} style={{ marginBottom: 6, fontSize: 12 }}>
                  t:{h.t.toFixed(2)}s • x:{h.x.toFixed(3)} • v:{h.v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Inline styles */
const buttonStyle = {
  background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
  border: "none",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 13,
};

const mutedButton = {
  background: "rgba(255,255,255,0.04)",
  border: "none",
  color: "#fff",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
};

const dangerButton = {
  background: "linear-gradient(90deg,#ef4444,#f97316)",
  border: "none",
  color: "#fff",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
};

const controlBox = {
  background: "rgba(255,255,255,0.02)",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.03)",
  minWidth: 140,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle = { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)" };