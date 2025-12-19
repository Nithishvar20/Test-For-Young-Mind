// src/components/chemistry/PeriodicPuzzle.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * PeriodicPuzzle — redesigned layout
 * - Fixed to viewport below top bar
 * - Tiles on the right, Elements (targets) on the left
 * - Recent Actions moved BELOW Elements and now displayed horizontally as chips
 * - Removed Auto Next / "Placed" / "Timer off" small status items
 * - Tap-only selection; compact UI; improved visual spacing
 *
 * Replace previous file with this.
 */

const DEFAULT_ELEMENTS = [
  { name: "Hydrogen", symbol: "H", number: 1 },
  { name: "Helium", symbol: "He", number: 2 },
  { name: "Lithium", symbol: "Li", number: 3 },
  { name: "Beryllium", symbol: "Be", number: 4 },
  { name: "Boron", symbol: "B", number: 5 },
  { name: "Carbon", symbol: "C", number: 6 },
  { name: "Nitrogen", symbol: "N", number: 7 },
  { name: "Oxygen", symbol: "O", number: 8 },
  { name: "Fluorine", symbol: "F", number: 9 },
  { name: "Neon", symbol: "Ne", number: 10 },
  { name: "Sodium", symbol: "Na", number: 11 },
  { name: "Magnesium", symbol: "Mg", number: 12 },
  { name: "Aluminium", symbol: "Al", number: 13 },
  { name: "Silicon", symbol: "Si", number: 14 },
  { name: "Phosphorus", symbol: "P", number: 15 },
  { name: "Sulfur", symbol: "S", number: 16 },
  { name: "Chlorine", symbol: "Cl", number: 17 },
  { name: "Argon", symbol: "Ar", number: 18 },
  { name: "Potassium", symbol: "K", number: 19 },
  { name: "Calcium", symbol: "Ca", number: 20 },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Tile (compact) ---------- */
function Tile({ tile, selected, onTap }) {
  return (
    <button
      onClick={() => onTap(tile.id)}
      aria-pressed={selected}
      style={{
        cursor: "pointer",
        border: "none",
        padding: 10,
        borderRadius: 10,
        minWidth: 72,
        minHeight: 72,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: selected
          ? "linear-gradient(90deg,#6fb8ff,#4c6ef5)"
          : "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))",
        boxShadow: selected ? "0 12px 30px rgba(76,110,245,0.14)" : "0 6px 18px rgba(2,6,23,0.22)",
        color: selected ? "#021026" : "#fff",
        transition: "transform 140ms ease, box-shadow 140ms ease, background 140ms",
        transform: selected ? "translateY(-4px) scale(1.04)" : "translateY(0)",
        fontWeight: 800,
        fontSize: 18,
        userSelect: "none",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20 }}>{tile.label}</div>
      </div>
    </button>
  );
}

/* ---------- BigTarget (compact) ---------- */
function BigTarget({ t, onTap }) {
  const placed = t.placed;
  const bg =
    placed == null
      ? "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.04))"
      : placed.correct
      ? "linear-gradient(90deg,#10b981,#34d399)"
      : "linear-gradient(90deg,#ef4444,#fb7185)";

  const boxShadow =
    placed == null
      ? "0 8px 26px rgba(2,6,23,0.18)"
      : placed.correct
      ? "0 12px 30px rgba(16,185,129,0.10)"
      : "0 12px 30px rgba(239,68,68,0.10)";

  return (
    <div
      onClick={() => onTap(t.id)}
      role="button"
      aria-label={`Target ${t.element.name}`} 
      style={{
        background: bg,
        borderRadius: 12,
        padding: 12,
        minHeight: 96,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: placed ? "none" : "1px solid rgba(255,255,255,0.04)",
        boxShadow,
        transition: "transform 140ms ease, box-shadow 140ms ease, background 140ms ease",
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 900 }}>{t.element.name}</div>
        <div style={{ marginTop: 6, color: placed ? "#fff" : "rgba(255,255,255,0.72)", fontWeight: placed ? 800 : 400 }}>
          {placed ? (placed.correct ? "Correct!" : "Incorrect") : "Tap to place"}
        </div>
      </div>

      {t.placed && (
        <div
          style={{
            alignSelf: "flex-end",
            background: "#fff",
            color: "#04111a",
            padding: "6px 8px",
            borderRadius: 8,
            fontWeight: 900,
            boxShadow: t.placed.correct ? "0 8px 20px rgba(16,185,129,0.1)" : "0 8px 20px rgba(239,68,68,0.1)",
            fontSize: 13,
          }}
        >
          {t.placed.label}
        </div>
      )}
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function PeriodicPuzzle({ elements = DEFAULT_ELEMENTS }) {
  const [mode, setMode] = useState("symbol");
  const [count, setCount] = useState(8);
  const [timeLimit, setTimeLimit] = useState(0);

  const [pool, setPool] = useState([]);
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);
  const selectedRef = useRef(null);
  const selectedUI = useRef(null);

  function buildTiles(chosen) {
    return shuffle(chosen).map((el) => {
      return {
        id: `${el.symbol}-${el.number}`,
        label: mode === "symbol" ? el.symbol : String(el.number),
        element: el,
      };
    });
  }

  function newRound() {
    const chosen = shuffle(elements).slice(0, count);
    const tlist = shuffle(chosen.map((el) => ({ id: `t-${el.symbol}-${el.number}`, element: el, placed: null })));
    const tiles = shuffle(buildTiles(chosen));
    setPool(tiles);
    setTargets(tlist);
    setHistory([]);
    setRunning(true);
    setStreak(0);
    setTimeLeft(timeLimit);
    selectedRef.current = null;
    selectedUI.current = null;

    if (timeLimit > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  useEffect(() => {
    newRound();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, count, timeLimit]);

  // Tap-only selection (no hold)
  function selectTile(tileId) {
    if (!tileId) return;
    if (selectedRef.current === tileId) {
      selectedRef.current = null;
      selectedUI.current = null;
    } else {
      selectedRef.current = tileId;
      selectedUI.current = tileId;
    }
    setPool((p) => p.slice(0));
  }

  function placeAtTarget(targetId) {
    const tileId = selectedRef.current;
    if (!tileId) return;
    const tile = pool.find((x) => x.id === tileId);
    const target = targets.find((t) => t.id === targetId);
    if (!tile || !target) return;

    const correct = tile.element.symbol === target.element.symbol;
    const placedObj = { ...tile, correct };

    setTargets((prev) => prev.map((t) => (t.id === targetId ? { ...t, placed: placedObj } : t)));
    setPool((prev) => prev.filter((p) => p.id !== tileId));

    if (correct) {
      setScore((s) => s + 10);
      setStreak((s) => s + 1);
      setHistory((h) => [{ ok: true, tile, target, time: Date.now() }, ...h].slice(0, 12));
    } else {
      setScore((s) => Math.max(0, s - 5));
      setStreak(0);
      setHistory((h) => [{ ok: false, tile, target, time: Date.now() }, ...h].slice(0, 12));
    }

    selectedRef.current = null;
    selectedUI.current = null;
    setPool((p) => p.slice(0));

    // Stop when all placed (no auto-next)
    const allPlaced = targets.every((t) => t.placed || t.id === targetId);
    if (allPlaced) {
      setRunning(false);
    }
  }

  function reveal(targetId) {
    const t = targets.find((x) => x.id === targetId);
    if (!t) return;
    const match = pool.find((p) => p.element.symbol === t.element.symbol);
    if (match) {
      const placedObj = { ...match, correct: true, revealed: true };
      setTargets((prev) => prev.map((tt) => (tt.id === targetId ? { ...tt, placed: placedObj } : tt)));
      setPool((prev) => prev.filter((p) => p.id !== match.id));
      setHistory((h) => [{ ok: true, revealed: true, tile: match, target: t, time: Date.now() }, ...h].slice(0, 12));
    }
  }

  function resetScore() {
    setScore(0);
    setStreak(0);
    newRound();
  }

  const remaining = pool.length;
  const placedCount = targets.filter((t) => t.placed).length;

  useEffect(() => {
    function onKey(e) {
      if (e.key >= "1" && e.key <= "9") {
        const idx = Number(e.key) - 1;
        if (pool[idx]) selectTile(pool[idx].id);
      }
      if (e.key === "n") newRound();
      if (e.key === "r") resetScore();
      if (e.key === "Escape") {
        selectedRef.current = null;
        selectedUI.current = null;
        setPool((p) => p.slice(0));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pool]);

  function TileGrid() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))",
          gap: 10,
          alignItems: "stretch",
        }}
      >
        {pool.map((tile) => (
          <div key={tile.id} style={{ display: "flex" }}>
            <Tile tile={tile} selected={selectedUI.current === tile.id} onTap={selectTile} />
          </div>
        ))}
      </div>
    );
  }

  function TargetsGrid() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {targets.map((t) => (
          <BigTarget key={t.id} t={t} onTap={placeAtTarget} />
        ))}
      </div>
    );
  }

  // Fixed screen wrapper under top bar
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 72, // below topbar
        bottom: 0,
        overflow: "hidden",
        padding: 18,
        boxSizing: "border-box",
        color: "#fff",
        background: "linear-gradient(180deg,#190926,#081322 40%)",
      }}
    >
      <div style={{ height: "100%", boxSizing: "border-box", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0 , fontSize: 28, textAlign: "left", fontWeight: 900 }}>Periodic Table Puzzle</h1>
            <div style={{ marginTop: 6, color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
              Tap a Symbol tile, then tap the Element name.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ textAlign: "right", marginRight: 10 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Score</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{score}</div>
            </div>

            <div style={{ textAlign: "right", marginRight: 8 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Streak</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{streak}</div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => newRound()} style={compactActionBtn}>New</button>
              <button onClick={() => resetScore()} style={{ ...compactActionBtn, background: "#ef4444" }}>Reset</button>
            </div>
          </div>
        </div>

        {/* Controls row (Auto Next removed) */}
        <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={controlPill}>
            <label style={{ fontWeight: 700, color: "rgba(255,255,255,0.9)", marginRight: 8 }}>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={compactSelect}>
              <option value="symbol">Match → Symbol</option>
              <option value="number">Match → Atomic number</option>
            </select>
          </div>

          <div style={controlPill}>
            <label style={{ fontWeight: 700, color: "rgba(255,255,255,0.9)", marginRight: 8 }}>Items</label>
            <input type="range" min={3} max={12} value={count} onChange={(e) => setCount(Number(e.target.value))} style={{ width: 160 }} />
            <div style={{ fontWeight: 900, marginLeft: 8 }}>{count}</div>
          </div>

          <div style={controlPill}>
            <label style={{ fontWeight: 700, color: "rgba(255,255,255,0.9)", marginRight: 8 }}>Timer</label>
            <input type="range" min={0} max={120} step={10} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} style={{ width: 160 }} />
            <div style={{ fontWeight: 700, marginLeft: 8 }}>{timeLimit === 0 ? "Off" : `${timeLimit}s`}</div>
          </div>

          <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.8)" }}>
            <div style={{ fontSize: 12 }}>Status</div>
            <div style={{ fontWeight: 700 }}>{running ? "Running" : "Paused"}</div>
          </div>
        </div>

        {/* Main playground: left = elements + recent/hints, right = tiles */}
        <div style={{ display: "flex", gap: 14, marginTop: 14, flex: "1 1 auto", minHeight: 0 }}>
          {/* LEFT: Elements + Recent + Hints (scrollable) */}
          <div style={{ flex: 1, overflow: "auto", padding: 14, borderRadius: 12, background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.04))", boxShadow: "0 12px 40px rgba(2,6,23,0.45)" }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 12 }}>Elements</div>
            <TargetsGrid />

            {/* Recent Actions (moved under elements) - HORIZONTAL */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Recent Actions</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                {history.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>No actions yet — tap tiles to play.</div>}
                {history.map((h, i) => (
                  <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 140, background: "rgba(255,255,255,0.02)", padding: '8px 12px', borderRadius: 10, boxShadow: '0 8px 20px rgba(2,6,23,0.15)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: h.ok ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#021026', fontWeight: 800 }}>
                      {h.tile.label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontWeight: 800 }}>{h.tile.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{h.target.element.name}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', color: h.ok ? '#10b981' : '#ef4444', fontWeight: 900 }}>{h.ok ? '✔' : '✖'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints (moved under elements) */}
            
          </div>

          {/* RIGHT: Tiles panel */}
          <aside style={{ width: 360, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 30px rgba(2,6,23,0.35)" }}>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>Tiles — Tap to select</div>
              <TileGrid />
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Remaining: <strong>{remaining}</strong></div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button onClick={() => setPool([])} style={miniBtnDanger}>Clear</button>
                  <button onClick={() => newRound()} style={miniBtn}>Shuffle</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          /* on small screens, stack columns */
          div[style*="display: flex; gap: 14; margin-top: 14;"] {
            flex-direction: column !important;
          }
          aside[style*="width: 360px"] { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- styles ---------- */
const compactActionBtn = {
  background: "linear-gradient(90deg,#60a5fa,#2563eb)",
  color: "#041026",
  border: "none",
  padding: "8px 10px",
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 13,
};

const compactSelect = {
  padding: "6px 8px",
  borderRadius: 8,
  fontSize: 13,
  border: "none",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
};

const controlPill = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  background: "rgba(255,255,255,0.02)",
  padding: "8px 10px",
  borderRadius: 12,
  fontSize: 13,
};

const smallBtn = {
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  border: "none",
  padding: "6px 8px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};

const miniBtn = { ...smallBtn, padding: "6px 8px", fontSize: 12 };
const miniBtnDanger = { ...miniBtn, background: "#fb7185" };
