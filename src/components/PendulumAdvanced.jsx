// src/components/PendulumAdvanced.jsx
import React, { useRef, useEffect, useState } from "react";

/**
 * PendulumAdvanced.jsx
 * - canvas-based pendulum animation
 * - display: angle, angular velocity, KE, PE, total energy
 * - theoretical period T = 2*pi*sqrt(L/g) (L in meters). We use length px -> meters scaling = 1px -> 0.01 m (adjustable)
 * - "Measure period" button to compute experimental period by peak detection
 */

export default function PendulumAdvanced() {
  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  const rafRef = useRef(null);

  // Controls (React state)
  const [lengthPx, setLengthPx] = useState(200); // px
  const [gravity, setGravity] = useState(9.8); // m/s^2
  const [damping, setDamping] = useState(0.998);
  const [mass, setMass] = useState(1.0); // kg
  const [angleDeg, setAngleDeg] = useState(30); // starting angle in degrees

  // internal refs for fast updates
  const angleRef = useRef((angleDeg * Math.PI) / 180);
  const angularVelRef = useRef(0);
  const timeRef = useRef(0);
  const graphDataRef = useRef([]); // stores energy points

  // measurement
  const [measuredPeriod, setMeasuredPeriod] = useState(null);
  const measurementRef = useRef({
    lastPeakTime: null,
    lastPeakAngle: null,
    peaks: [],
  });

  // conversion: px -> meters (so L meters = lengthPx * pxToMeter)
  const pxToMeter = 0.01; // 1 px = 0.01 m -> length 200 px = 2 m; adjust if desired

  // compute theoretical period small-angle approximation
  const lengthMeters = Math.max(0.05, lengthPx * pxToMeter);
  const theoreticalT = 2 * Math.PI * Math.sqrt(lengthMeters / Math.max(0.0001, gravity));

  // effect: when user changes initial angle slider, reset starting angle
  useEffect(() => {
    angleRef.current = (angleDeg * Math.PI) / 180;
    angularVelRef.current = 0;
    // clear measurement
    measurementRef.current = { lastPeakTime: null, lastPeakAngle: null, peaks: [] };
    setMeasuredPeriod(null);
  }, [angleDeg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const graph = graphRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    function resize() {
      const parentWidth = canvas.parentElement.clientWidth || 640;
      canvas.width = parentWidth;
      canvas.height = 420;
      if (graph) {
        graph.width = Math.min(400, parentWidth);
        graph.height = 120;
      }
    }
    resize();
    window.addEventListener("resize", resize);

    let lastTs = performance.now();

    function step(ts) {
      const dt = (ts - lastTs) / 1000; // seconds
      lastTs = ts;
      timeRef.current += dt;

      // physics (small time step integration)
      const angle = angleRef.current;
      const angVel = angularVelRef.current;

      // equation: theta'' = - (g/L) * sin(theta)
      const L = Math.max(10, lengthPx); // px
      const aAcc = (-gravity / Math.max(0.0001, L * pxToMeter)) * Math.sin(angle);

      let newAngVel = angVel + aAcc * dt;
      newAngVel *= damping;
      let newAngle = angle + newAngVel * dt;

      angleRef.current = newAngle;
      angularVelRef.current = newAngVel;

      // energy computations (units: Joules)
      const y0 = 0; // reference pivot
      // potential energy: m * g * h ; set bob vertical position relative to pivot (h = L - L cos theta)
      const h = (L * pxToMeter) * (1 - Math.cos(newAngle));
      const pe = mass * gravity * h;
      const bobSpeed = (Math.abs(newAngVel) * L * pxToMeter); // v = omega * L (approx)
      const ke = 0.5 * mass * bobSpeed * bobSpeed;
      const totalE = ke + pe;

      // push energy points for graph
      graphDataRef.current.push({ t: timeRef.current, ke, pe, totalE });
      if (graphDataRef.current.length > 400) graphDataRef.current.shift();

      // peak detection (simple sign change of angular velocity near extrema)
      const prevAngVel = angVel;
      // detect a peak when angular velocity crosses zero from positive to negative and angle magnitude is sizable
      if (prevAngVel > 0 && newAngVel <= 0 && Math.abs(newAngle) > 0.05) {
        const now = timeRef.current;
        const mr = measurementRef.current;
        if (mr.lastPeakTime != null) {
          const period = now - mr.lastPeakTime;
          mr.peaks.push(period);
          // keep last 5 periods
          if (mr.peaks.length > 6) mr.peaks.shift();
          const avg = mr.peaks.reduce((a, b) => a + b, 0) / mr.peaks.length;
          setMeasuredPeriod(Number(avg.toFixed(3)));
        }
        mr.lastPeakTime = now;
        mr.lastPeakAngle = newAngle;
      }

      // draw on canvas
      drawPendulum(ctx, canvas.width, canvas.height, L, newAngle);

      // draw energy graph
      if (graph) drawEnergyGraph(graph.getContext("2d"), graph.width, graph.height, graphDataRef.current);

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthPx, gravity, damping, mass]);

  function drawPendulum(ctx, width, height, Lpx, theta) {
    ctx.clearRect(0, 0, width, height);

    // background
    ctx.fillStyle = "rgba(0,0,0,0.02)";
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2;
    const originY = 80;
    const bobX = originX + Lpx * Math.sin(theta);
    const bobY = originY + Lpx * Math.cos(theta);

    // rod
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // pivot
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(originX, originY, 5, 0, Math.PI * 2);
    ctx.fill();

    // bob
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
    ctx.fill();

    // labels
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "13px Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
    const angleDeg = (theta * 180) / Math.PI;
    ctx.fillText(`θ: ${angleDeg.toFixed(1)}°`, 12, height - 56);
    ctx.fillText(`ω: ${angularVelRef.current.toFixed(3)} rad/s`, 12, height - 36);
  }

  function drawEnergyGraph(gctx, gw, gh, data) {
    gctx.clearRect(0, 0, gw, gh);
    // background
    gctx.fillStyle = "rgba(0,0,0,0.02)";
    gctx.fillRect(0, 0, gw, gh);

    if (!data.length) return;
    // get latest time window
    const t0 = data[0].t;
    const t1 = data[data.length - 1].t;
    const dt = Math.max(0.001, t1 - t0);

    // compute max E to scale
    const maxE = Math.max(...data.map((d) => d.totalE)) || 1;

    // draw axes
    gctx.strokeStyle = "rgba(255,255,255,0.08)";
    gctx.lineWidth = 1;
    gctx.beginPath();
    gctx.moveTo(0, gh - 0.5);
    gctx.lineTo(gw, gh - 0.5);
    gctx.stroke();

    // draw PE (green), KE (blue), total (purple)
    function plot(color, extractor) {
      gctx.strokeStyle = color;
      gctx.lineWidth = 1.6;
      gctx.beginPath();
      data.forEach((pt, i) => {
        const x = ((pt.t - t0) / dt) * gw;
        const v = extractor(pt) / maxE;
        const y = gh - 1 - v * (gh - 4);
        if (i === 0) gctx.moveTo(x, y);
        else gctx.lineTo(x, y);
      });
      gctx.stroke();
    }
    plot("#34d399", (p) => p.pe);
    plot("#60a5fa", (p) => p.ke);
    plot("#c084fc", (p) => p.totalE);
  }

  function resetPendulum() {
    angleRef.current = (angleDeg * Math.PI) / 180;
    angularVelRef.current = 0;
    timeRef.current = 0;
    graphDataRef.current = [];
    measurementRef.current = { lastPeakTime: null, lastPeakAngle: null, peaks: [] };
    setMeasuredPeriod(null);
  }

  function clearMeasurement() {
    measurementRef.current = { lastPeakTime: null, lastPeakAngle: null, peaks: [] };
    setMeasuredPeriod(null);
  }

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: 6 }}>Pendulum — Advanced</h2>
      <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 0 }}>
        Interactive pendulum with energy plot and experimental period measurement.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 12 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
          <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: 8 }} />

          <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ color: "#fff", minWidth: 160 }}>
              Length: {Math.round(lengthPx)} px
              <br />
              <input type="range" min={80} max={380} value={lengthPx} onChange={(e) => setLengthPx(Number(e.target.value))} />
            </label>

            <label style={{ color: "#fff", minWidth: 160 }}>
              Gravity: {gravity.toFixed(2)} m/s²
              <br />
              <input
                type="range"
                min={0.5}
                max={20}
                step={0.1}
                value={gravity}
                onChange={(e) => setGravity(Number(e.target.value))}
              />
            </label>

            <label style={{ color: "#fff", minWidth: 160 }}>
              Damping: {damping.toFixed(3)}
              <br />
              <input
                type="range"
                min={0.95}
                max={0.999}
                step={0.001}
                value={damping}
                onChange={(e) => setDamping(Number(e.target.value))}
              />
            </label>

            <label style={{ color: "#fff", minWidth: 160 }}>
              Mass: {mass.toFixed(2)} kg
              <br />
              <input type="range" min={0.1} max={5} step={0.1} value={mass} onChange={(e) => setMass(Number(e.target.value))} />
            </label>

            <label style={{ color: "#fff", minWidth: 160 }}>
              Start angle: {angleDeg}°
              <br />
              <input
                type="range"
                min={2}
                max={80}
                value={angleDeg}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
              />
            </label>

            <button
              onClick={resetPendulum}
              style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#6b46c1", color: "#fff" }}
            >
              Reset
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center", flexWrap: "wrap", color: "#fff" }}>
            <div>
              <div style={{ fontWeight: 800 }}>Theoretical period (small angle):</div>
              <div>{theoreticalT.toFixed(3)} s</div>
            </div>

            <div>
              <div style={{ fontWeight: 800 }}>Measured period (avg):</div>
              <div>{measuredPeriod == null ? "—" : `${measuredPeriod}s`}</div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={clearMeasurement}
                style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff" }}
              >
                Clear Measurement
              </button>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                Tip: Let it swing freely and measure a few peaks.
              </div>
            </div>
          </div>
        </div>

        <div style={{ minWidth: 420 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: 800, color: "#fff", marginBottom: 8 }}>Energy (recent)</div>
            <canvas ref={graphRef} style={{ width: "100%", height: 120, background: "transparent", borderRadius: 6 }} />
            <div style={{ color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
              Blue = KE, Green = PE, Purple = total energy (units: J). Total energy should be roughly conserved (damping
              slowly reduces it).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}