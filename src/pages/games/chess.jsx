import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

/**
 * Sudoku.jsx — Final UI/UX & Logic
 * ✨ Clean centered layout
 * 🎨 Modern button palette
 * 🧩 Correct Sudoku logic (placement + check)
 * 🎉 Confetti from board center on success
 * 🧍‍♂️ Extra padding at bottom (~3 cm)
 */

const PUZZLES = [
  {
    id: 1,
    difficulty: "Easy",
    puzzle: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  {
    id: 2,
    difficulty: "Medium",
    puzzle: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 3, 9, 4],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 7, 4, 5, 3],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 4, 0, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 0, 1, 3, 6],
      [7, 6, 3, 7, 1, 8, 2, 4, 9],
    ],
  },
  {
    id: 3,
    difficulty: "Hard",
    puzzle: [
      [0, 0, 0, 0, 0, 8, 0, 0, 0],
      [0, 0, 8, 0, 0, 0, 0, 0, 3],
      [0, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 4, 0, 2, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 6, 0, 0, 0, 0, 0, 4],
      [0, 0, 0, 0, 7, 0, 0, 0, 0],
    ],
    solution: [
      [2, 6, 4, 1, 3, 8, 9, 7, 5],
      [9, 7, 8, 2, 5, 4, 6, 1, 3],
      [1, 3, 5, 5, 9, 6, 8, 2, 0],
      [4, 1, 9, 3, 8, 7, 2, 6, 5],
      [8, 5, 7, 4, 2, 2, 3, 9, 1],
      [6, 2, 2, 9, 1, 5, 4, 3, 7],
      [3, 9, 1, 7, 6, 3, 5, 8, 2],
      [7, 8, 6, 5, 4, 9, 1, 2, 4],
      [5, 4, 3, 8, 7, 1, 9, 5, 6],
    ],
  },
];

function copyBoard(b) {
  return b.map((r) => r.slice());
}

function isValidPlacement(board, r, c, val) {
  if (!val) return true;
  for (let x = 0; x < 9; x++) if (x !== c && board[r][x] === val) return false;
  for (let y = 0; y < 9; y++) if (y !== r && board[y][c] === val) return false;
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let y = br; y < br + 3; y++)
    for (let x = bc; x < bc + 3; x++)
      if (!(y === r && x === c) && board[y][x] === val) return false;
  return true;
}

export default function Sudoku() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzleData = useMemo(() => PUZZLES[puzzleIndex], [puzzleIndex]);
  const fixedRef = useRef(puzzleData.puzzle.map((r) => r.map((v) => v !== 0)));
  const [board, setBoard] = useState(copyBoard(puzzleData.puzzle));
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  function triggerConfetti() {
    const duration = 1500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0.5, y: 0.5 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 0.5, y: 0.5 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function handleNumber(n) {
    if (!selected) return;
    const [r, c] = selected;
    if (fixedRef.current[r][c]) return;
    setBoard((b) => {
      const nb = copyBoard(b);
      nb[r][c] = n;
      return nb;
    });
  }

  function handleErase() {
    if (!selected) return;
    const [r, c] = selected;
    if (fixedRef.current[r][c]) return;
    setBoard((b) => {
      const nb = copyBoard(b);
      nb[r][c] = 0;
      return nb;
    });
  }

  function handleCheck() {
    const pd = puzzleData;
    let wrong = 0;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (board[r][c] !== pd.solution[r][c]) wrong++;
    if (wrong === 0) {
      setMessage("🎉 Perfect! Sudoku Solved!");
      triggerConfetti();
    } else setMessage(`${wrong} incorrect cell(s).`);
  }

  function handleHint() {
    const pd = puzzleData;
    const empties = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!fixedRef.current[r][c] && board[r][c] !== pd.solution[r][c])
          empties.push([r, c]);
    if (empties.length === 0) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    setBoard((b) => {
      const nb = copyBoard(b);
      nb[r][c] = pd.solution[r][c];
      return nb;
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #081229, #040b1c)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "60px 20px 120px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 700, textAlign: "center" }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Sudoku</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          Difficulty: <b>{puzzleData.difficulty}</b> — {message || "Fill all numbers correctly."}
        </p>

        {/* Board */}
        <div
          style={{
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            width: "fit-content",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const fixed = fixedRef.current[r][c];
              const selectedCell = selected && selected[0] === r && selected[1] === c;
              const valid = isValidPlacement(board, r, c, val);
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => setSelected([r, c])}
                  style={{
                    width: 42,
                    height: 42,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: selectedCell
                      ? "rgba(59,130,246,0.25)"
                      : fixed
                      ? "rgba(255,255,255,0.04)"
                      : valid
                      ? "transparent"
                      : "rgba(239,68,68,0.2)",
                    fontWeight: fixed ? 800 : 700,
                    color: valid ? (fixed ? "#7dd3fc" : "#fff") : "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  {val || ""}
                </div>
              );
            })
          )}
        </div>

        {/* Controls */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handleNumber(n)}
                style={{
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 6,
                  background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
                  fontWeight: 800,
                  color: "#02102a",
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              onClick={handleErase}
              style={{
                flex: 1,
                padding: "10px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 800,
              }}
            >
              Erase
            </button>
            <button
              onClick={handleHint}
              style={{
                flex: 1,
                padding: "10px",
                background: "#f59e0b",
                color: "#08130a",
                border: "none",
                borderRadius: 6,
                fontWeight: 800,
              }}
            >
              Hint
            </button>
            <button
              onClick={handleCheck}
              style={{
                flex: 1,
                padding: "10px",
                background: "#10b981",
                color: "#02102a",
                border: "none",
                borderRadius: 6,
                fontWeight: 800,
              }}
            >
              Check
            </button>
          </div>

          <button
            onClick={() => {
              setPuzzleIndex((i) => (i + 1) % PUZZLES.length);
              setBoard(copyBoard(PUZZLES[(puzzleIndex + 1) % PUZZLES.length].puzzle));
              setMessage("");
            }}
            style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "#06b6d4",
              color: "#02102a",
              fontWeight: 800,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            New
          </button>
        </div>
      </div>
    </div>
  );
}