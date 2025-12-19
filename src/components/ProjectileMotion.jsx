// src/components/ProjectileMotion.jsx
import React, { useRef, useEffect, useState } from "react";

/*
Advanced ProjectileMotion.jsx
- RK4 integrator with quadratic drag: F_drag = 0.5 * rho * Cd * A * v_rel * |v_rel|
- wind vector (m/s)
- restitution (bounces) or stop mode
- analytic "no-drag" dotted trajectory for comparison
- trail, multi-shot history, impact splash animation
- small XY plot of y vs x
- many controls for education / experimentation
*/

const RHO = 1.225; // air density (kg/m^3)

function vecAdd(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function vecSub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function vecScale(a, s) { return [a[0] * s, a[1] * s]; }
function vecLen(a) { return Math.sqrt(a[0]*a[0] + a[1]*a[1]); }

export default function ProjectileMotion() {
  // controls / parameters
  const [speed, setSpeed] = useState(45); // m/s
  const [angleDeg, setAngleDeg] = useState(40);
  const [mass, setMass] = useState(1.0); // kg
  const [Cd, setCd] = useState(0.47); // drag coefficient (sphere ~0.47)
  const [area, setArea] = useState(0.03); // m^2 cross-sectional
  const [gravity, setGravity] = useState(9.8); // m/s^2
  const [windX, setWindX] = useState(0); // m/s
  const [windY, setWindY] = useState(0); // m/s
  const [restitution, setRestitution] = useState(0.0); // 0=no bounce
  const [timeScale, setTimeScale] = useState(1.0); // simulation speed multiplier
  const [dt, setDt] = useState(0.016); // integration timestep (s)

  // view / canvas refs
  const canvasRef = useRef(null);
  const plotRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);

  // sim state
  const [launched, setLaunched] = useState(false);
  const [paused, setPaused] = useState(false);
  const simRef = useRef({
    pos: [0, 0],        // meters (x right, y up positive — we'll flip for canvas)
    vel: [0, 0],        // m/s
    t: 0,
    trail: [],
    shots: [],          // store previous shots (arrays of points)
    splash: null,       // {x,y,age}
  });

  // scale: meters -> px on canvas (dynamic)
  const metersToPxRef = useRef(5); // updated in resize to fit canvas

  // derived analytic (no-drag) values
  const angleRad = (angleDeg * Math.PI) / 180;
  const rangeAnalytic = (speed * speed * Math.sin(2 * angleRad)) / gravity;
  const tFlightAnalytic = (2 * speed * Math.sin(angleRad)) / gravity;
  const hMaxAnalytic = (speed * speed * Math.pow(Math.sin(angleRad), 2)) / (2 * gravity);

  // UI state for measured values
  const [measured, setMeasured] = useState({ tFlight: null, range: null, hMax: null });

  // reset sim state
  function resetAll() {
    setLaunched(false);
    setPaused(false);
    simRef.current = { pos: [0,0], vel: [0,0], t: 0, trail: [], shots: [], splash: null };
    setMeasured({ tFlight: null, range: null, hMax: null });
  }

  // prepare a shot (set initial pos/vel)
  function prepareShot() {
    const vx = speed * Math.cos(angleRad);
    const vy = speed * Math.sin(angleRad);
    // initial pos: x=0, y=0 (ground)
    simRef.current.pos = [0, 0];
    simRef.current.vel = [vx, vy];
    simRef.current.t = 0;
    simRef.current.trail = [];
    simRef.current.splash = null;
    setMeasured({ tFlight: null, range: null, hMax: null });
  }

  // perform RK4 step for ODE: state = [x,y,vx,vy]
  function stepRK4(state, dtLocal, params) {
    // state: [x,y,vx,vy]
    // params: {mass, Cd, A, wind, g}
    const deriv = (s) => {
      const vx = s[2], vy = s[3];
      const vel = [vx, vy];
      const rel = vecSub(vel, params.wind); // v_rel = v - wind
      const vrel = vecLen(rel);
      // drag force (quadratic): Fd = -0.5 * rho * Cd * A * v_rel * |v_rel| * (rel/|rel|)
      let drag = [0,0];
      if (vrel > 1e-6) {
        const dragMag = 0.5 * RHO * params.Cd * params.A * vrel * vrel;
        drag = vecScale(rel, -dragMag / vrel); // direction opposite to rel
      }
      // acceleration: a = (F_gravity + F_drag) / m
      const acc = [drag[0] / params.m, drag[1] / params.m - params.g]; // note gravity downward in -y
      return [vx, vy, acc[0], acc[1]];
    };

    // RK4
    const s = state;
    const k1 = deriv(s);
    const s2 = s.map((v,i) => v + k1[i] * dtLocal * 0.5);
    const k2 = deriv(s2);
    const s3 = s.map((v,i) => v + k2[i] * dtLocal * 0.5);
    const k3 = deriv(s3);
    const s4 = s.map((v,i) => v + k3[i] * dtLocal);
    const k4 = deriv(s4);
    const next = s.map((v,i) => v + (dtLocal/6) * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]));
    return next;
  }

  // main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const plot = plotRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pctx = plot ? plot.getContext("2d") : null;

    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 420;
      if (plot) {
        plot.width = Math.min(420, canvas.parentElement.clientWidth);
        plot.height = 160;
      }
      // choose metersToPx to fit analytic range nicely on canvas width
      const idealRange = Math.max(10, rangeAnalytic * 1.4);
      const pixels = canvas.width * 0.75; // leave some margin
      metersToPxRef.current = Math.max(1, pixels / idealRange);
    }
    resize();
    window.addEventListener("resize", resize);

    function drawGround() {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      // horizon / ground
      ctx.fillStyle = "#081018";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      // grid lines every meter (scaled)
      const m2px = metersToPxRef.current;
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      // vertical grid
      const leftPx = 40;
      for (let mx = 0; mx < canvas.width / m2px; mx += 5) {
        const x = leftPx + mx * m2px;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height - 40);
        ctx.stroke();
      }
      // horizontal baseline
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 40);
      ctx.lineTo(canvas.width, canvas.height - 40);
      ctx.stroke();
    }

    function drawPredictiveTrajectory() {
      // analytic no-drag dotted curve: x = vx0 * t, y = vy0 * t - 0.5 g t^2
      const m2px = metersToPxRef.current;
      const leftPx = 40;
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.setLineDash([4,6]);
      ctx.beginPath();
      const steps = 120;
      for (let i=0;i<=steps;i++) {
        const t = (i/steps) * tFlightAnalytic;
        const x = speed * Math.cos(angleRad) * t;
        const y = speed * Math.sin(angleRad) * t - 0.5 * gravity * t*t;
        const px = leftPx + x * m2px;
        const py = canvas.height - 40 - y * m2px;
        if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawTrail(trailPoints) {
      if (!trailPoints.length) return;
      const m2px = metersToPxRef.current;
      const leftPx = 40;
      ctx.lineWidth = 2;
      for (let s=trailPoints.length-1, i=0;i<trailPoints.length;i++) {
        const p = trailPoints[i];
        const px = leftPx + p[0] * m2px;
        const py = canvas.height - 40 - p[1] * m2px;
        const alpha = 0.2 + 0.8*(i / trailPoints.length);
        ctx.fillStyle = `rgba(250,202,21,${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI*2);
        ctx.fill();
      }
    }

    function drawProjectile(pos) {
      const m2px = metersToPxRef.current;
      const leftPx = 40;
      const px = leftPx + pos[0] * m2px;
      const py = canvas.height - 40 - pos[1] * m2px;
      // shadow
      ctx.beginPath();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.ellipse(px + 6, canvas.height - 34, 10, 4, 0, 0, Math.PI*2);
      ctx.fill();
      // projectile
      ctx.beginPath();
      ctx.fillStyle = "#facc15";
      ctx.arc(px, py, 8, 0, Math.PI*2);
      ctx.fill();
      // outline
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawShotsHistory(shots) {
      const m2px = metersToPxRef.current;
      const leftPx = 40;
      ctx.lineWidth = 1.6;
      shots.forEach((shot, idx) => {
        const alpha = 0.12 + 0.18*(idx+1);
        ctx.strokeStyle = `rgba(100,100,255,${alpha})`;
        ctx.beginPath();
        shot.forEach((p,i) => {
          const px = leftPx + p[0]*m2px;
          const py = canvas.height - 40 - p[1]*m2px;
          if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        });
        ctx.stroke();
      });
    }

    function drawObstacles() {
      // example: a platform and a wall (static)
      const m2px = metersToPxRef.current;
      const leftPx = 40;
      ctx.fillStyle = "rgba(200,100,255,0.12)";
      // platform at x = 20m to 30m, y = 5m
      const px1 = leftPx + 20*m2px;
      const py1 = canvas.height - 40 - 5*m2px;
      ctx.fillRect(px1, py1, 10*m2px, 6);
    }

    function drawSplash(splash) {
      if (!splash) return;
      const {x,y,age} = splash;
      const m2px = metersToPxRef.current;
      const leftPx = 40;
      const px = leftPx + x*m2px;
      const py = canvas.height - 40 - y*m2px;
      const maxAge = 0.6;
      const a = Math.max(0, 1 - age/maxAge);
      ctx.beginPath();
      ctx.fillStyle = `rgba(250,90,90,${0.6*a})`;
      ctx.arc(px, py, 12*a + 2, 0, Math.PI*2);
      ctx.fill();
    }

    function drawUI() {
      // labels and side panel
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "13px Inter, system-ui, -apple-system, 'Segoe UI', Roboto";
      ctx.fillText(`Speed: ${speed.toFixed(1)} m/s  Angle: ${angleDeg.toFixed(1)}°`, 10, 18);
      ctx.fillText(`Drag Cd: ${Cd.toFixed(2)}  Area: ${area.toFixed(3)} m²  Mass: ${mass.toFixed(2)} kg`, 10, 36);
      ctx.fillText(`Wind: (${windX.toFixed(1)}, ${windY.toFixed(1)}) m/s`, 10, 54);
      ctx.fillText(`Analytic range: ${rangeAnalytic.toFixed(2)} m  T_flight: ${tFlightAnalytic.toFixed(2)} s`, 10, 72);
    }

    function renderFrame(now) {
      // main loop
      if (!lastTsRef.current) lastTsRef.current = now;
      const elapsed = (now - lastTsRef.current) / 1000;
      lastTsRef.current = now;

      // clear
      ctx.clearRect(0,0,canvas.width, canvas.height);
      drawGround();
      drawObstacles();
      drawPredictiveTrajectory();
      drawShotsHistory(simRef.current.shots);

      // splash aging
      if (simRef.current.splash) {
        simRef.current.splash.age += elapsed;
        if (simRef.current.splash.age > 0.8) simRef.current.splash = null;
      }

      // if running and not paused, advance simulation with dt steps scaled by timeScale
      if (launched && !paused) {
        // integrate using small fixed steps to remain stable
        const targetStep = Math.min(0.05, dt); // clamp
        let remaining = elapsed * timeScale;
        while (remaining > 1e-6) {
          const step = Math.min(targetStep, remaining);
          // current state vector for integrator: [x,y,vx,vy]
          let state = [
            simRef.current.pos[0],
            simRef.current.pos[1],
            simRef.current.vel[0],
            simRef.current.vel[1],
          ];
          const params = {
            m: mass,
            Cd: Cd,
            A: area,
            wind: [windX, windY],
            g: gravity,
          };
          const next = stepRK4(state, step, params);
          simRef.current.pos = [next[0], next[1]];
          simRef.current.vel = [next[2], next[3]];
          simRef.current.t += step;
          // add to trail
          simRef.current.trail.push([...simRef.current.pos]);
          if (simRef.current.trail.length > 1200) simRef.current.trail.shift();

          // collision with ground y <= 0
          if (simRef.current.pos[1] <= 0) {
            // hit ground; measure final range/time/height
            const measuredRange = simRef.current.pos[0];
            setMeasured((m) => ({ ...m, range: Number(measuredRange.toFixed(3)), tFlight: Number(simRef.current.t.toFixed(3)), hMax: m.hMax }));
            // splash
            simRef.current.splash = { x: simRef.current.pos[0], y: 0, age: 0 };
            // decide bounce or stop
            if (restitution > 0.001 && Math.abs(simRef.current.vel[1]) > 0.5) {
              simRef.current.vel[1] = -simRef.current.vel[1] * restitution;
              simRef.current.pos[1] = 0.001; // small offset
            } else {
              // stop
              simRef.current.shots.unshift(simRef.current.trail.slice());
              if (simRef.current.shots.length > 6) simRef.current.shots.pop();
              setLaunched(false);
              // compute measured max height
              const hmax = Math.max(...simRef.current.trail.map(p => p[1]));
              setMeasured((m) => ({ ...m, hMax: Number(hmax.toFixed(3)) }));
              break;
            }
          }

          remaining -= step;
        }
      }

      // draw trail and projectile
      drawTrail(simRef.current.trail);
      if (simRef.current.trail.length) {
        const last = simRef.current.trail[simRef.current.trail.length - 1];
        drawProjectile(last);
      }

      drawSplash(simRef.current.splash);
      drawUI();

      // update plot of current trail
      if (pctx) {
        pctx.clearRect(0,0,plot.width, plot.height);
        pctx.fillStyle = "#071022";
        pctx.fillRect(0,0,plot.width, plot.height);
        // axes
        pctx.strokeStyle = "rgba(255,255,255,0.08)";
        pctx.beginPath();
        pctx.moveTo(40, plot.height - 30);
        pctx.lineTo(plot.width - 10, plot.height - 30);
        pctx.stroke();
        // plot current trail y vs x scaled to fit
        const pts = simRef.current.trail;
        if (pts.length) {
          const maxX = Math.max(...pts.map(p=>p[0]), rangeAnalytic);
          const maxY = Math.max(...pts.map(p=>p[1]), hMaxAnalytic);
          const pw = plot.width - 60;
          const ph = plot.height - 50;
          pctx.strokeStyle = "#60a5fa";
          pctx.beginPath();
          pts.forEach((p, i) => {
            const px = 40 + (p[0] / Math.max(1e-6, maxX)) * pw;
            const py = (plot.height - 30) - (p[1] / Math.max(1e-6, maxY)) * ph;
            if (i===0) pctx.moveTo(px,py); else pctx.lineTo(px,py);
          });
          pctx.stroke();
          // labels
          pctx.fillStyle = "rgba(255,255,255,0.85)";
          pctx.font = "12px Inter, system-ui";
          pctx.fillText(`x (m)`, 10, plot.height - 10);
          pctx.fillText(`y (m)`, plot.width - 30, 12);
        }
      }

      rafRef.current = requestAnimationFrame(renderFrame);
    }

    rafRef.current = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      lastTsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launched, paused, speed, angleDeg, Cd, area, mass, gravity, windX, windY, restitution, dt, timeScale]);

  // handle launch/button events
  function handleLaunch() {
    prepareShot();
    setLaunched(true);
    setPaused(false);
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.code === "Space") {
        e.preventDefault();
        if (!launched) handleLaunch();
      } else if (e.key === "p" || e.key === "P") {
        setPaused(p => !p);
      } else if (e.key === "r" || e.key === "R") {
        resetAll();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [launched]);

  // draw analytic trajectory points for quick preview (before launching)
  function computeAnalyticPoints(num=120) {
    const pts = [];
    for (let i=0;i<=num;i++) {
      const t = (i/num) * tFlightAnalytic;
      const x = speed * Math.cos(angleRad) * t;
      const y = speed * Math.sin(angleRad) * t - 0.5 * gravity * t*t;
      if (y >= -1) pts.push([x,y]);
    }
    return pts;
  }

  return (
    <div style={{ color: "#fff" }}>
      <h2 style={{ marginTop: 0 }}>Projectile Motion — Advanced</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", color: "#fff" }}>
                Speed: {speed} m/s
                <input style={{ width: "100%" }} type="range" min={5} max={120} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
              </label>
            </div>

            <div style={{ width: 160 }}>
              <label style={{ display: "block", color: "#fff" }}>
                Angle: {angleDeg}°
                <input style={{ width: "100%" }} type="range" min={5} max={85} value={angleDeg} onChange={(e) => setAngleDeg(Number(e.target.value))} />
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <label style={{ display: "block", color: "#fff" }}>
              Mass: {mass.toFixed(2)} kg
              <input style={{ width: "100%" }} type="range" min={0.1} max={10} step={0.1} value={mass} onChange={(e) => setMass(Number(e.target.value))} />
            </label>

            <label style={{ display: "block", color: "#fff" }}>
              Cd: {Cd.toFixed(2)}
              <input style={{ width: "100%" }} type="range" min={0.05} max={1.2} step={0.01} value={Cd} onChange={(e) => setCd(Number(e.target.value))} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <label style={{ display: "block", color: "#fff", width: 180 }}>
              Area: {area.toFixed(3)} m²
              <input style={{ width: "100%" }} type="range" min={0.005} max={0.2} step={0.005} value={area} onChange={(e)=>setArea(Number(e.target.value))} />
            </label>

            <label style={{ display: "block", color: "#fff", width: 200 }}>
              Wind X: {windX.toFixed(1)} m/s
              <input style={{ width: "100%" }} type="range" min={-20} max={20} step={0.5} value={windX} onChange={(e)=>setWindX(Number(e.target.value))} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <label style={{ display: "block", color: "#fff", width: 180 }}>
              Wind Y: {windY.toFixed(1)} m/s
              <input style={{ width: "100%" }} type="range" min={-10} max={10} step={0.5} value={windY} onChange={(e)=>setWindY(Number(e.target.value))} />
            </label>

            <label style={{ display: "block", color: "#fff", width: 200 }}>
              Restitution: {restitution.toFixed(2)}
              <input style={{ width: "100%" }} type="range" min={0} max={0.9} step={0.01} value={restitution} onChange={(e)=>setRestitution(Number(e.target.value))} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleLaunch} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#000", fontWeight: 700 }}>
              Launch (Space)
            </button>
            <button onClick={() => setPaused(p => !p)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff" }}>
              {paused ? "Resume (P)" : "Pause (P)"}
            </button>
            <button onClick={resetAll} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#6b46c1", color: "#fff" }}>
              Reset (R)
            </button>
            <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.8)" }}>
              Analytic range: <strong>{rangeAnalytic.toFixed(2)} m</strong> | flight: <strong>{tFlightAnalytic.toFixed(2)} s</strong>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 8, background: "#071029" }} />
          </div>
        </div>

        <div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: 800 }}>Measured (simulation)</div>
            <div style={{ marginTop: 8 }}>
              Time of flight: <strong>{measured.tFlight ?? "—"} s</strong><br/>
              Range: <strong>{measured.range ?? "—"} m</strong><br/>
              Max height: <strong>{measured.hMax ?? "—"} m</strong>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.06)", margin: "12px 0" }} />

            <div style={{ fontWeight: 800 }}>Controls</div>
            <div style={{ marginTop: 8 }}>
              dt: <input type="range" min={0.005} max={0.05} step={0.001} value={dt} onChange={(e)=>setDt(Number(e.target.value))} style={{ width: "100%" }} />
              Time scale: <input type="range" min={0.25} max={4.0} step={0.25} value={timeScale} onChange={(e)=>setTimeScale(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.06)", margin: "12px 0" }} />

            <div style={{ fontWeight: 800 }}>Shots history</div>
            <div style={{ marginTop: 8 }}>
              {simRef.current.shots.length ? simRef.current.shots.map((s,i)=>(
                <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Shot {i+1}: {s.length} points</div>
              )) : <div style={{ color: "rgba(255,255,255,0.6)" }}>No previous shots</div>}
            </div>
          </div>

          <div style={{ marginTop: 12, background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: 800 }}>Trajectory plot</div>
            <canvas ref={plotRef} style={{ width: "100%", marginTop: 8, borderRadius: 6, background: "#071022" }} />
            <div style={{ color: "rgba(255,255,255,0.7)", marginTop: 8, fontSize: 13 }}>
              Plot of y vs x for current shot. Analytic (no-drag) is dotted overlay on main canvas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}