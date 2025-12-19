// src/pages/games/TicTacToe.jsx
import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
// read theme from app-level ThemeContext if available
import { useTheme } from "../../state/ThemeContext";

/* winning lines */
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function findWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(Boolean)) return { winner: "draw", line: [] };
  return null;
}

/* minimax AI */
function minimax(board, depth, isMax, alpha, beta) {
  const res = findWinner(board);
  if (res) {
    if (res.winner === "O") return { score: 10 - depth };
    if (res.winner === "X") return { score: depth - 10 };
    return { score: 0 };
  }
  const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);

  if (isMax) {
    let best = { score: -Infinity, index: null };
    for (let i of empty) {
      const newBoard = [...board];
      newBoard[i] = "O";
      const r = minimax(newBoard, depth + 1, false, alpha, beta);
      if (r.score > best.score) best = { score: r.score, index: i };
      alpha = Math.max(alpha, r.score);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = { score: Infinity, index: null };
    for (let i of empty) {
      const newBoard = [...board];
      newBoard[i] = "X";
      const r = minimax(newBoard, depth + 1, true, alpha, beta);
      if (r.score < best.score) best = { score: r.score, index: i };
      beta = Math.min(beta, r.score);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export default function TicTacToe() {
  const navigate = useNavigate();

  // ---------- Theme plumbing: read from app-level ThemeContext ----------
  // We try to be defensive: support different shapes returned by useTheme()
  // useTheme() may provide { themeKey } or { theme } or just a string — we handle it.
  let ctx = {};
  try {
    ctx = useTheme?.() ?? {};
  } catch (e) {
    ctx = {};
  }

  // pick a key from common possible properties
  const ctxThemeKey = typeof ctx === "string" ? ctx : ctx?.themeKey ?? ctx?.theme ?? ctx?.current ?? "dark";

  const THEMES = {
    dark: {
      key: "dark",
      label: "Dark",
      themeCss: "linear-gradient(180deg,#2a0a2e 0%, #0b0614 100%)",
      swatch: "linear-gradient(90deg,#2a0a2e,#0b0614)",
    },
    ocean: {
      key: "ocean",
      label: "Ocean",
      themeCss: "linear-gradient(180deg,#071129 0%, #0b1220 100%)",
      swatch: "linear-gradient(90deg,#06b6d4,#3b82f6)",
    },
    sunrise: {
      key: "sunrise",
      label: "Sunrise",
      themeCss: "linear-gradient(180deg,#ffecd2 0%, #fcb69f 100%)",
      swatch: "linear-gradient(90deg,#ffd166,#ff9f1c)",
    },
  };

  const themeKey = THEMES[ctxThemeKey] ? ctxThemeKey : "dark";
  const themeCss = THEMES[themeKey]?.themeCss || THEMES.dark.themeCss;
  // --------------------------------------------------------------------

  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [moves, setMoves] = useState(0);
  const [winInfo, setWinInfo] = useState(null);

  const [mode] = useState("ai");
  const [selIndex, setSelIndex] = useState(4);

  const [tileSize, setTileSize] = useState(96);
  const boardRef = useRef(null);

  const headerTopOffset = 74;

  useEffect(() => {
    function measure() {
      const vw = Math.min(window.innerWidth, 1200);
      const vh = window.innerHeight;
      const boardTarget = Math.min(420, Math.round(Math.min(vw * 0.46, vh * 0.5)));
      const gap = Math.max(8, Math.round(boardTarget * 0.055));
      const tile = Math.floor((boardTarget - gap * 2) / 3);
      setTileSize(Math.max(56, tile - 1));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    setWinInfo(findWinner(board));
  }, [board]);

  const handleClick = (i) => {
    if (winInfo || board[i]) return;
    if (mode === "ai" && !xIsNext) return;
    const nb = [...board];
    nb[i] = xIsNext ? "X" : "O";
    setBoard(nb);
    setXIsNext((v) => !v);
    setMoves((m) => m + 1);
    setSelIndex(i);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setMoves(0);
    setWinInfo(null);
    setSelIndex(4);
  };

  // AI move
  useEffect(() => {
    if (mode !== "ai") return;
    if (xIsNext) return;
    if (winInfo) return;

    const t = setTimeout(() => {
      const emptyCells = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
      if (!emptyCells.length) return;

      // Always play best move (100% minimax)
      const best = minimax(board, 0, true, -Infinity, Infinity);
      const idx = best.index ?? emptyCells[0];

      if (idx != null && board[idx] === null) {
        const nb = [...board];
        nb[idx] = "O";
        setBoard(nb);
        setXIsNext(true);
        setMoves((m) => m + 1);
        setSelIndex(idx);
      }
    }, 360 + Math.floor(Math.random() * 220));

    return () => clearTimeout(t);
  }, [board, xIsNext, mode, winInfo]);

  // keyboard navigation & place (arrow keys + Enter)
  useEffect(() => {
    function onKey(e) {
      if (winInfo) return;
      const row = Math.floor(selIndex / 3);
      const col = selIndex % 3;
      if (e.key === "ArrowUp") {
        setSelIndex(((row + 2) % 3) * 3 + col);
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        setSelIndex(((row + 1) % 3) * 3 + col);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        setSelIndex(row * 3 + ((col + 2) % 3));
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        setSelIndex(row * 3 + ((col + 1) % 3));
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        if (mode === "ai" && !xIsNext) return;
        handleClick(selIndex);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selIndex, xIsNext, mode, winInfo]);

  const gap = Math.max(8, Math.round(tileSize * 0.055));
  const gridSize = tileSize * 3 + gap * 2;
  const cardPadding = 18;
  const containerWidth = gridSize + cardPadding * 2;
  const showConfetti = !!(winInfo && winInfo.winner && winInfo.winner !== "draw");

  // Prevent any accidental drag on the document while on this fixed view
  useEffect(() => {
    function onDragPrevent(e) {
      e.preventDefault();
    }
    document.addEventListener("dragstart", onDragPrevent);
    return () => document.removeEventListener("dragstart", onDragPrevent);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: themeCss, // apply selected theme from top bar (ThemeContext)
        backgroundAttachment: "fixed",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden", // no scroll
        padding: "12px",
        boxSizing: "border-box",
        WebkitUserDrag: "none", // Safari/Chrome drag prevention
        userSelect: "none",
        touchAction: "manipulation",
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={240} />}

      <div style={{ height: headerTopOffset }} />

      <header style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: 32 }}>Tic Tac Toe</h1>
      </header>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          maxWidth: containerWidth,
          marginBottom: 14,
          paddingLeft: 6,
          paddingRight: 6,
          boxSizing: "border-box",
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={reset}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            background: "linear-gradient(90deg,#ffd166,#ff9f1c)",
            border: "none",
            fontWeight: 700,
            color: "#06121b",
            cursor: "pointer",
            WebkitUserDrag: "none",
          }}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          Restart
        </button>

        <button
          onClick={() => navigate("/games")}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#fff",
            cursor: "pointer",
            WebkitUserDrag: "none",
          }}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          Back to Hub
        </button>

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 14 }}>
            Moves: <strong>{moves}</strong>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {winInfo ? (winInfo.winner === "draw" ? "It's a draw!" : `${winInfo.winner} wins!`) : `${xIsNext ? "X" : "O"} to move`}
          </div>
        </div>
      </div>

      <div
        ref={boardRef}
        style={{
          width: containerWidth,
          padding: cardPadding,
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(8,12,20,0.75), rgba(20,26,33,0.75))",
          boxShadow: "0 30px 90px rgba(2,6,23,0.6), inset 0 4px 12px rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.03)",
          WebkitUserDrag: "none",
          userSelect: "none",
          touchAction: "manipulation",
          pointerEvents: "auto",
        }}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          style={{
            width: gridSize,
            height: gridSize,
            display: "grid",
            gridTemplateColumns: `repeat(3, ${tileSize}px)`,
            gridTemplateRows: `repeat(3, ${tileSize}px)`,
            gap,
            placeItems: "center",
            margin: "0 auto",
          }}
        >
          {board.map((cell, i) => {
            const isWinningCell = winInfo && winInfo.line?.includes(i);
            const isSelected = selIndex === i && !winInfo;
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={!!winInfo || (mode === "ai" && !xIsNext)}
                aria-label={`Cell ${i + 1}`}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  width: tileSize,
                  height: tileSize,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: Math.round(tileSize * 0.5),
                  fontWeight: 900,
                  cursor: winInfo ? "default" : "pointer",
                  border: isSelected ? "2px solid rgba(124,58,237,0.95)" : "1px solid rgba(255,255,255,0.03)",
                  background:
                    cell === "X"
                      ? "linear-gradient(180deg,#fee2e2,#fca5a5)"
                      : cell === "O"
                      ? "linear-gradient(180deg,#bbf7d0,#86efac)"
                      : "linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01))",
                  color: cell === "X" ? "#b91c1c" : cell === "O" ? "#047857" : "rgba(255,255,255,0.42)",
                  boxShadow: isWinningCell
                    ? "0 10px 28px rgba(0,0,0,0.6), 0 0 12px rgba(255,255,255,0.02)"
                    : "inset 0 2px 10px rgba(0,0,0,0.45)",
                  transition: "all 160ms ease",
                  userSelect: "none",
                  WebkitUserDrag: "none",
                }}
              >
                {cell || ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}