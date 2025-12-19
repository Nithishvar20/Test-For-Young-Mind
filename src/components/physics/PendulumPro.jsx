import React, { useRef, useEffect, useState } from "react";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export default function PendulumPro() {
  const TOPBAR_HEIGHT = 72;
  const length = 1.0; // fixed pendulum length
  const DEFAULT_THETA = 0.9; // rad
  const DEFAULT_OMEGA = 0.0; // rad/s

  const [mass, setMass] = useState(1.0);
  const [damping, setDamping] = useState(0.05);
  const [g, setG] = useState(9.81);
  const [driveAmp, setDriveAmp] = useState(0.0);
  const [driveFreq, setDriveFreq] = useState(1.5);
  const [dt, setDt] = useState(0.01);
  const [timeScale, setTimeScale] = useState(1.0);
  const [running, setRunning] = useState(false);

  const stateRef = useRef({ t: 0, theta: DEFAULT_THETA, omega: DEFAULT_OMEGA });
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const canvasRef = useRef(null);

  const [history, setHistory] = useState([]);
  const crossingsRef = useRef([]);
  const maxHistory = 3000;

  const analyticPeriod = 2 * Math.PI * Math.sqrt(length / g);

  function energy(theta, omega) {
    const KE = 0.5 * mass * Math.pow(length * omega, 2);
    const PE = mass * g * length * (1 - Math.cos(theta));
    return { KE, PE, E: KE + PE };
  }

  function derivs(s, t) {
    const b_over_m = damping / mass;
    const drive = driveAmp
      ? (driveAmp / (mass * Math.pow(length, 2))) * Math.sin(driveFreq * t)
      : 0;
    return {
      thetaDot: s.omega,
      omegaDot: -(g / length) * Math.sin(s.theta) - b_over_m * s.omega + drive,
    };
  }

  function rk4Step(s, t, h) {
    const k1 = derivs(s, t);
    const s2 = {
      theta: s.theta + 0.5 * h * k1.thetaDot,
      omega: s.omega + 0.5 * h * k1.omegaDot,
    };
    const k2 = derivs(s2, t + 0.5 * h);
    const s3 = {
      theta: s.theta + 0.5 * h * k2.thetaDot,
      omega: s.omega + 0.5 * h * k2.omegaDot,
    };
    const k3 = derivs(s3, t + 0.5 * h);
    const s4 = {
      theta: s.theta + h * k3.thetaDot,
      omega: s.omega + h * k3.omegaDot,
    };
    const k4 = derivs(s4, t + h);
    return {
      theta:
        s.theta +
        (h / 6) *
          (k1.thetaDot + 2 * k2.thetaDot + 2 * k3.thetaDot + k4.thetaDot),
      omega:
        s.omega +
        (h / 6) *
          (k1.omegaDot + 2 * k2.omegaDot + 2 * k3.omegaDot + k4.omegaDot),
    };
  }

  function reset() {
    stateRef.current = { t: 0, theta: DEFAULT_THETA, omega: DEFAULT_OMEGA };
    setHistory([
      {
        t: 0,
        theta: DEFAULT_THETA,
        omega: DEFAULT_OMEGA,
        ...energy(DEFAULT_THETA, DEFAULT_OMEGA),
      },
    ]);
    crossingsRef.current = [];
    draw();
  }

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function resize() {
      const parent = canvas.parentElement;
      const availW = Math.max(400, parent.clientWidth);
      const availH = Math.max(400, window.innerHeight - TOPBAR_HEIGHT - 160);
      canvas.width = Math.floor(availW);
      canvas.height = Math.floor(availH);
      draw();
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [mass, damping, driveAmp, driveFreq, dt, timeScale, g]);

  useEffect(() => {
    function step(now) {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const elapsedMS = now - lastTimeRef.current;
      lastTimeRef.current = now;
      const scaled = (elapsedMS / 1000) * timeScale;

      if (running && scaled > 1e-8) {
        let rem = scaled;
        while (rem > 1e-8) {
          const h = Math.min(dt, rem);
          const cur = stateRef.current;
          const nxt = rk4Step(cur, cur.t, h);
          const tNext = cur.t + h;
          if (cur.theta < 0 && nxt.theta >= 0 && nxt.omega > 0) {
            crossingsRef.current.push(tNext);
            if (crossingsRef.current.length > 40)
              crossingsRef.current.shift();
          }
          stateRef.current = { t: tNext, theta: nxt.theta, omega: nxt.omega };
          rem -= h;
        }
        setHistory((harr) => {
          const st = stateRef.current;
          const e = energy(st.theta, st.omega);
          const nxt = harr.concat({
            t: st.t,
            theta: st.theta,
            omega: st.omega,
            ...e,
          });
          if (nxt.length > maxHistory) nxt.shift();
          return nxt;
        });
      }

      draw();
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, dt, timeScale, driveAmp, driveFreq, damping, mass, g]);

  // === Draw pendulum (no trail) ===
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#071129";
    ctx.fillRect(0, 0, W, H);

    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const horizSpace = Math.max(W / 2 - 24, 40);
    const vertSpace = Math.max(H / 2 - 24, 40);
    const maxLenPx = Math.min(horizSpace, vertSpace);
    const scale = Math.max(30, Math.min(maxLenPx / Math.max(0.001, length), 260));

    const st = stateRef.current;
    const bobX = cx + Math.sin(st.theta) * length * scale;
    const bobY = cy + Math.cos(st.theta) * length * scale;

    // rod
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // pivot
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // bob
    const bobR = Math.max(8, Math.min(20, 8 + mass * 2));
    ctx.beginPath();
    ctx.fillStyle = "#60a5fa";
    ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2);
    ctx.fill();
  }

  function handleToggleRun() {
    setRunning((r) => {
      const next = !r;
      if (next) lastTimeRef.current = null;
      return next;
    });
  }
  function handleReset() {
    setRunning(false);
    reset();
  }

  const current = stateRef.current;
  const lastH = history.length ? history[history.length - 1] : null;
  const measuredT =
    crossingsRef.current.length > 2
      ? crossingsRef.current[crossingsRef.current.length - 1] -
        crossingsRef.current[crossingsRef.current.length - 2]
      : null;

  const container = {
    maxWidth: 1280,
    margin: "10px auto",
    display: "flex",
    gap: 12,
    padding: 12,
  };
  const card = {
    background: "linear-gradient(180deg,#0f1724,#0b1220)",
    borderRadius: 10,
    padding: 12,
    color: "#e6eef8",
    boxShadow: "0 8px 24px rgba(2,6,23,0.45)",
  };

  return (
    <div
      style={{
        paddingTop: TOPBAR_HEIGHT + 8,
        background: "#071129",
        minHeight: "100vh",
      }}
    >
      <div style={container}>
        {/* LEFT: Pendulum */}
        <div style={{ ...card, flex: "0 0 45%" }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
            Pendulum Display
          </div>
          <div
            style={{
              borderRadius: 8,
              background: "#071024",
              height: "65vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        {/* CENTER: Controls */}
        <div style={{ ...card, flex: "0 0 30%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Controls</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleToggleRun} style={smallButton}>
                {running ? "Pause" : "Run"}
              </button>
              <button onClick={handleReset} style={smallDanger}>
                Reset
              </button>
            </div>
          </div>

          <Control
            label="Mass (kg)"
            value={mass}
            set={setMass}
            min={0.1}
            max={5}
            step={0.05}
            purpose="Heavier bobs swing slower due to inertia."
          />
          <Control
            label="Damping"
            value={damping}
            set={setDamping}
            min={0}
            max={1.2}
            step={0.01}
            purpose="Frictional resistance that slows motion over time."
          />
          <Control
            label="Gravity (m/s²)"
            value={g}
            set={setG}
            min={1}
            max={15}
            step={0.01}
            purpose="Controls how strong the gravitational pull is."
          />
          <Control
            label="Time step (dt)"
            value={dt}
            set={setDt}
            min={0.001}
            max={0.05}
            step={0.001}
            purpose="Smaller steps give more accurate simulation but slower speed."
          />
          <Control
            label="Time scale"
            value={timeScale}
            set={setTimeScale}
            min={0.1}
            max={4}
            step={0.05}
            purpose="Adjusts overall simulation speed."
          />
          <Control
            label="Drive amplitude"
            value={driveAmp}
            set={setDriveAmp}
            min={0}
            max={6}
            step={0.01}
            purpose="Strength of external periodic force applied."
          />
          <Control
            label="Drive frequency"
            value={driveFreq}
            set={setDriveFreq}
            min={0}
            max={8}
            step={0.01}
            purpose="Frequency of external periodic driving force."
          />
        </div>

        {/* RIGHT: Measurements */}
        <div style={{ ...card, flex: "0 0 25%" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Measurements</h3>
          <div style={infoRow}>
            <div>Angle</div>
            <div>{(current.theta * 180) / Math.PI.toFixed(2)}°</div>
          </div>
          <div style={infoRow}>
            <div>Angular Velocity</div>
            <div>{current.omega.toFixed(3)} rad/s</div>
          </div>
          <div
            style={{
              fontWeight: 900,
              color: "#dbeefe",
              marginTop: 10,
              marginBottom: 4,
            }}
          >
            Energy (J)
          </div>
          <div style={infoRow}>
            <div>KE</div>
            <div>{lastH ? lastH.KE.toFixed(3) : "—"}</div>
          </div>
          <div style={infoRow}>
            <div>PE</div>
            <div>{lastH ? lastH.PE.toFixed(3) : "—"}</div>
          </div>
          <div style={infoRow}>
            <div>Total</div>
            <div>{lastH ? lastH.E.toFixed(3) : "—"}</div>
          </div>
          <hr
            style={{
              border: "none",
              height: 1,
              background: "rgba(255,255,255,0.1)",
              margin: "10px 0",
            }}
          />
          <div style={infoRow}>
            <div>Analytic Period</div>
            <div>{analyticPeriod.toFixed(3)} s</div>
          </div>
          <div style={infoRow}>
            <div>Measured Period</div>
            <div>{measuredT ? measuredT.toFixed(3) + " s" : "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Control({ label, value, set, min, max, step, purpose }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#cfe6ff",
        }}
      >
        <div>{label}</div>
        <div style={{ color: "#9fb6d8" }}>{value.toFixed(2)}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={sliderStyle}
      />
      <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 2 }}>
        {purpose}
      </div>
    </div>
  );
}

/* === Styles === */
const smallButton = {
  background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};
const smallDanger = {
  ...smallButton,
  background: "linear-gradient(90deg,#ef4444,#f97316)",
};
const sliderStyle = {
  width: "100%",
  appearance: "none",
  height: 8,
  borderRadius: 6,
  background: "linear-gradient(90deg,#2b3a4b,#17202a)",
  outline: "none",
};
const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
  fontSize: 13,
};