import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Utility: shuffle and pick N random items
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickN(arr, n) {
  return shuffleArray(arr).slice(0, n);
}

// Create the word grid
function createGrid(size, words) {
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );
  const placements = [];
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  function canPlace(w, x, y, dx, dy) {
    for (let i = 0; i < w.length; i++) {
      const nx = x + dx * i,
        ny = y + dy * i;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) return false;
      const c = grid[ny][nx];
      if (c && c !== w[i]) return false;
    }
    return true;
  }

  function place(w) {
    for (let a = 0; a < 300; a++) {
      const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
      const x = Math.floor(Math.random() * size),
        y = Math.floor(Math.random() * size);
      if (canPlace(w, x, y, dx, dy)) {
        for (let i = 0; i < w.length; i++)
          grid[y + dy * i][x + dx * i] = w[i];
        placements.push({ word: w, x, y, dx, dy, len: w.length });
        return true;
      }
    }
    return false;
  }

  for (const w of words) place(w.toUpperCase());
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (!grid[y][x])
        grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return { grid, placements };
}

export default function WordSearch() {
  const nav = useNavigate();

  const baseWordItems = [
    { word: "apple", clue: "A common fruit, often red or green." },
    { word: "banana", clue: "A long yellow fruit that monkeys love." },
    { word: "school", clue: "A place where students learn." },
    { word: "react", clue: "A popular JavaScript library for building UIs." },
    { word: "quiz", clue: "A short test to check knowledge." },
    { word: "game", clue: "An activity played for fun or competition." },
    { word: "water", clue: "A clear liquid essential for life." },
    { word: "earth", clue: "Our planet; also soil or ground." },
    { word: "india", clue: "A country in South Asia with diverse cultures." },
    { word: "tiger", clue: "A big striped cat found in Asia." },
  ];

  const [lastWords, setLastWords] = useState([]);
  const [wordItems, setWordItems] = useState(() => pickN(baseWordItems, 6));

  function getNewWordSet() {
    const available = baseWordItems.filter(
      (w) => !lastWords.some((lw) => lw.word === w.word)
    );
    const selected =
      available.length >= 6 ? pickN(available, 6) : pickN(baseWordItems, 6);
    setLastWords(selected);
    return selected;
  }

  const [gridObj, setGridObj] = useState(null);
  const [found, setFound] = useState([]);
  const [sel, setSel] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [startTime, setStartTime] = useState(Date.now());
  const [showCongrats, setShowCongrats] = useState(false);
  const [cellSize, setCellSize] = useState(44);

  useEffect(() => setGridObj(createGrid(12, wordItems.map((w) => w.word))), [wordItems]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeout(() => nav("/"), 600);
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, nav]);

  useEffect(() => {
    function recompute() {
      const cols = gridObj?.grid?.[0]?.length || 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight - 200;
      const maxBoardWidth = Math.max(420, Math.min(vw * 0.55, vh * 0.92));
      const gapTotal = 8 * (cols - 1);
      const padding = 36;
      const available = Math.max(240, maxBoardWidth - gapTotal - padding);
      const size = Math.floor(available / cols);
      setCellSize(Math.max(28, Math.min(80, size)));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [gridObj]);

  function toggleCell(x, y) {
    setSel((prev) => {
      const exists = prev.some((c) => c.x === x && c.y === y);
      if (exists) return prev.filter((c) => !(c.x === x && c.y === y));
      return [...prev, { x, y }];
    });
  }

  function coordsForPlacement(p) {
    return Array.from({ length: p.len }, (_, i) => ({
      x: p.x + p.dx * i,
      y: p.y + p.dy * i,
    }));
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((c, i) => c.x === b[i].x && c.y === b[i].y);
  }

  function confirmSelection() {
    if (!gridObj || sel.length === 0) return;
    for (const p of gridObj.placements) {
      if (found.includes(p.word)) continue;
      const coords = coordsForPlacement(p);
      if (arraysEqual(coords, sel) || arraysEqual(coords.slice().reverse(), sel)) {
        const newFound = [...found, p.word];
        setFound(newFound);
        setSel([]);

        if (newFound.length === wordItems.length) {
          const totalTime = Math.round((Date.now() - startTime) / 1000);
          setTimeout(() => {
            setShowCongrats(true);
            console.log(`🎉 Completed in ${totalTime}s`);
          }, 500);
        }
        return;
      }
    }
    setSel([]);
  }

  function clearSelection() {
    setSel([]);
  }

  function showHint() {
    if (!gridObj) return;
    const next = wordItems.find((w) => !found.includes(w.word.toUpperCase()));
    if (!next) return;
    const placement = gridObj.placements.find((p) => p.word === next.word.toUpperCase());
    if (!placement) return;
    const hint = { x: placement.x, y: placement.y };
    setSel([hint]);
    setTimeout(() => setSel([]), 1400);
  }

  function resetGame() {
    const newSet = getNewWordSet();
    setWordItems(newSet);
    setGridObj(createGrid(12, newSet.map((w) => w.word)));
    setFound([]);
    setSel([]);
    setTimeLeft(150);
    setStartTime(Date.now());
    setShowCongrats(false);
  }

  if (!gridObj)
    return <div className="card" style={{ padding: 20 }}>Preparing puzzle...</div>;

  const cols = gridObj.grid[0].length;
  const gridTemplate = `repeat(${cols}, ${cellSize}px)`;

  return (
    <div className="card" style={{ padding: 20, overflow: "hidden", paddingTop: 96 }}>
      <style>{`
        .layout { display:grid; grid-template-columns: 55% 120px 25%; gap:24px; align-items:start; }
        .board-wrap { background: rgba(17,24,39,0.96); padding:22px; border-radius:16px; box-shadow: 0 12px 46px rgba(0,0,0,0.55); position:relative; display:flex; justify-content:center; }
        .board-grid { touch-action: manipulation; user-select: none; }
        .ws-cell { user-select:none; cursor:pointer; transition:transform 0.08s ease; }
        .ws-cell:active { transform:scale(0.96); }
        .timer-badge { display:flex; align-items:center; gap:8px; background: rgba(255,255,255,0.08); padding:14px 20px; border-radius:16px; font-weight:900; font-size:26px; justify-content:center; }
        .button-stack { display:flex; flex-direction:column; align-items:stretch; justify-content:center; gap:14px; height:100%; }
        .button-panel { background: rgba(255,255,255,0.03); padding:10px; border-radius:12px; box-shadow: 0 8px 20px rgba(0,0,0,0.25); }
        .control-btn { min-width:100px; padding:12px 14px; border:none; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer; box-shadow:0 6px 15px rgba(0,0,0,0.22); transition:transform 0.08s ease; }
        .control-btn:active { transform:scale(0.96); }
        .clue { padding:6px 8px; border-radius:8px; margin-bottom:8px; font-weight:700; font-size:13px; }
      `}</style>

      <h2 className="text-2xl font-bold">Find the word — read the sentence and locate it in the grid</h2>

      <div className="layout" style={{ marginTop: 16 }}>
        {/* Left: grid */}
        <div className="board-wrap">
          <div
            className="board-grid"
            style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: 8 }}
          >
            {gridObj.grid.map((row, y) =>
              row.map((ch, x) => {
                const selected = sel.some((c) => c.x === x && c.y === y);
                const partOfFound = gridObj.placements.some(
                  (p) =>
                    found.includes(p.word) &&
                    Array.from({ length: p.len }).some(
                      (_, i) => p.x + p.dx * i === x && p.y + p.dy * i === y
                    )
                );

                return (
                  <div
                    key={`${x}-${y}`}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      toggleCell(x, y);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCell(x, y);
                      }
                    }}
                    className="ws-cell"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: Math.max(6, Math.floor(cellSize * 0.18)),
                      background: selected
                        ? "linear-gradient(135deg,#ffecd2,#fcb69f)"
                        : partOfFound
                        ? "linear-gradient(135deg,#4ade80,#22c55e)"
                        : "rgba(255,255,255,0.04)",
                      color: partOfFound || selected ? "#111" : "#fafafa",
                      fontWeight: 900,
                      fontSize: Math.max(12, Math.floor(cellSize * 0.35)),
                      boxShadow: selected
                        ? "0 8px 20px rgba(255,138,0,0.45)"
                        : "0 4px 10px rgba(0,0,0,0.25)",
                    }}
                  >
                    {ch}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle buttons */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="button-panel">
            <div className="button-stack" style={{ width: 120 }}>
              <button className="control-btn" onClick={clearSelection} style={{ background: "#4b5563", color: "#fff" }}>🗑 Clear</button>
              <button className="control-btn" onClick={confirmSelection} style={{ background: "#22c55e", color: "#fff" }}>✅ Confirm</button>
              <button className="control-btn" onClick={resetGame} style={{ background: "#2563eb", color: "#fff" }}>🔄 Reset</button>
              <button className="control-btn" onClick={showHint} style={{ background: "#facc15", color: "#111" }}>💡 Hint</button>
            </div>
          </div>
        </div>

        {/* Right clues */}
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <div className="timer-badge">⏳ <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span></div>
          </div>

          <div style={{ overflowY: "auto", paddingRight: 10 }}>
            {wordItems.map((item) => {
              const foundFlag = found.includes(item.word.toUpperCase());
              return (
                <div
                  key={item.word}
                  className="clue"
                  style={{
                    background: foundFlag
                      ? "linear-gradient(90deg,#7c3aed,#4f46e5)"
                      : "rgba(255,255,255,0.03)",
                    color: foundFlag ? "#fff" : "#e6e6ea",
                  }}
                >
                  {item.clue}
                  {foundFlag && (
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      Found: {item.word.toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🎉 Congrats Modal */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              style={{
                background: "linear-gradient(135deg,#60a5fa,#7c3aed)",
                padding: 40,
                borderRadius: 18,
                textAlign: "center",
                color: "#fff",
                width: "min(90%, 420px)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              }}
            >
              <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 12 }}>🎉 Congratulations!</h2>
              <p style={{ fontSize: 16, marginBottom: 28 }}>
                You found all <strong>{wordItems.length}</strong> words!
              </p>
              <button
                onClick={() => nav("/")}
                style={{
                  padding: "12px 20px",
                  background: "white",
                  color: "#111",
                  fontWeight: 800,
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                🏠 Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}