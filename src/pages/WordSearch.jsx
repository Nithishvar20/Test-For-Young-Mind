// src/pages/WordSearch.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../state/ThemeContext"; // ✅ theme hook added

/**
 * WordSearch.jsx
 * Touch-first + pointer/mouse fallback. Works in browsers and WebView/APK.
 */

function createGrid(size, words) {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
  const placements = [];
  const dirs = [
    [1, 0], [0, 1], [-1, 0], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  function canPlace(w, x, y, dx, dy) {
    for (let i = 0; i < w.length; i++) {
      const nx = x + dx * i, ny = y + dy * i;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) return false;
      const c = grid[ny][nx];
      if (c && c !== w[i]) return false;
    }
    return true;
  }

  function place(w) {
    for (let a = 0; a < 300; a++) {
      const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
      const x = Math.floor(Math.random() * size), y = Math.floor(Math.random() * size);
      if (canPlace(w, x, y, dx, dy)) {
        for (let i = 0; i < w.length; i++) grid[y + dy * i][x + dx * i] = w[i];
        placements.push({ word: w, x, y, dx, dy, len: w.length });
        return true;
      }
    }
    return false;
  }

  for (const w of words) place(w.toUpperCase());
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!grid[y][x])
    grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return { grid, placements };
}

export default function WordSearch() {
  const nav = useNavigate();
  const { theme } = useTheme?.() || {}; // ✅ read selected theme

  // Put your words (will be upper-cased internally)
  const words = ['apple', 'banana', 'school', 'react', 'quiz', 'game', 'water', 'earth', 'india', 'tiger'];
  const [gridObj, setGridObj] = useState(null);
  const [found, setFound] = useState([]);
  const [sel, setSel] = useState([]); // selected cells [{x,y},...]
  const [timeLeft, setTimeLeft] = useState(30);

  // refs
  const gridRef = useRef(null);
  const touchActiveRef = useRef(false);

  useEffect(() => setGridObj(createGrid(12, words)), []); // init once

  useEffect(() => {
    if (timeLeft <= 0) { setTimeout(() => nav('/'), 600); return; }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, nav]);

  const eq = (a, b) => a && b && a.x === b.x && a.y === b.y;

  function commitSelection(currentSel) {
    if (!gridObj || currentSel.length === 0) { setSel([]); return; }
    const first = currentSel[0];
    const last = currentSel[currentSel.length - 1];

    for (const p of gridObj.placements) {
      const sx = p.x, sy = p.y;
      const ex = p.x + p.dx * (p.len - 1), ey = p.y + p.dy * (p.len - 1);
      const matchForward = first.x === sx && first.y === sy && last.x === ex && last.y === ey;
      const matchReverse = first.x === ex && first.y === ey && last.x === sx && last.y === sy;
      if ((matchForward || matchReverse) && !found.includes(p.word)) {
        setFound(f => [...f, p.word]);
        break;
      }
    }
    setSel([]);
  }

  // ---------- Touch helpers (grid-level) ----------
  function cellFromPoint(clientX, clientY) {
    // Use elementFromPoint and data attributes to find the cell
    if (!gridRef.current) return null;
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const cell = el.closest('.ws-cell');
    if (!cell) return null;
    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);
    if (Number.isNaN(x) || Number.isNaN(y)) return null;
    return { x, y };
  }

  function handleTouchStart(e) {
    if (e.cancelable) e.preventDefault(); // stop scroll while interacting
    touchActiveRef.current = true;
    const t = e.touches[0];
    const cell = cellFromPoint(t.clientX, t.clientY);
    if (cell) setSel([{ x: cell.x, y: cell.y }]);
  }

  function handleTouchMove(e) {
    if (!touchActiveRef.current) return;
    if (e.cancelable) e.preventDefault();
    const t = e.touches[0];
    const cell = cellFromPoint(t.clientX, t.clientY);
    if (!cell) return;
    setSel(prev => {
      if (prev.some(c => c.x === cell.x && c.y === cell.y)) return prev;
      if (prev.length > 200) return []; // safety cap
      return [...prev, { x: cell.x, y: cell.y }];
    });
  }

  function handleTouchEnd(e) {
    if (e.cancelable) e.preventDefault();
    touchActiveRef.current = false;
    commitSelection(sel);
  }

  // ---------- Pointer/mouse (fallback) ----------
  const pointerState = useRef({ down: false });

  function handlePointerDown(e, x, y) {
    // only primary mouse button starts selection
    if (e.button && e.button !== 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    pointerState.current.down = true;
    setSel([{ x, y }]);
  }

  function handlePointerEnter(e, x, y) {
    if (!pointerState.current.down) return;
    setSel(prev => {
      if (prev.some(c => c.x === x && c.y === y)) return prev;
      if (prev.length > 200) return [];
      return [...prev, { x, y }];
    });
  }

  function handlePointerUp(e) {
    try { if (e.currentTarget && e.pointerId) e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
    pointerState.current.down = false;
    commitSelection(sel);
  }

  // single-tap fallback
  function handleTap(x, y) {
    commitSelection([{ x, y }]);
  }

  if (!gridObj) return <div className="card" style={{ padding: 20 }}>Preparing puzzle...</div>;

  return (
    <div
      className="card"
      style={{
        padding: 20,
        background: theme || undefined, // ✅ apply selected theme if present (no other changes)
      }}
    >
      <style>{`
        /* Important: these CSS rules ensure touch drag works inside WebView/APK */
        .word-grid { touch-action: none; -webkit-user-select: none; user-select: none; }
        .ws-cell { touch-action: none; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
        .ws-cell:active { transform: translateY(0); } /* avoid odd system styles */
      `}</style>

      <h2 className="text-3xl font-bold">Word Puzzle (30s)</h2>

      <div style={{ marginTop: 16, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* GRID */}
        <div
          ref={gridRef}
          className="word-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridObj.grid[0].length}, 48px)`,
            gap: 8,
            touchAction: 'none' /* inline guard */,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {gridObj.grid.map((row, y) => row.map((ch, x) => {
            const selected = sel.some(c => c.x === x && c.y === y);
            let partOfFound = false;
            for (const p of gridObj.placements) {
              if (found.includes(p.word)) {
                const { x: px, y: py, dx, dy, len } = p;
                for (let i = 0; i < len; i++) {
                  if (px + dx * i === x && py + dy * i === y) { partOfFound = true; break; }
                }
                if (partOfFound) break;
              }
            }

            return (
              <div
                key={`${x}-${y}`}
                data-x={x}
                data-y={y}
                className="ws-cell"
                onPointerDown={(e) => handlePointerDown(e, x, y)}
                onPointerEnter={(e) => handlePointerEnter(e, x, y)}
                onPointerUp={(e) => handlePointerUp(e)}
                onClick={() => handleTap(x, y)}
                style={{
                  width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8,
                  background: selected ? 'linear-gradient(135deg,#ffecd2,#fcb69f)' : partOfFound ? 'linear-gradient(135deg,#89f7fe,#66a6ff)' : 'rgba(255,255,255,0.06)',
                  color: partOfFound || selected ? '#111' : '#fafafa',
                  fontWeight: 900,
                  fontSize: 18,
                  boxShadow: selected ? '0 8px 20px rgba(255,138,0,0.5)' : '0 4px 10px rgba(0,0,0,0.25)',
                  userSelect: 'none',
                  touchAction: 'none',
                }}
              >
                {ch}
              </div>
            );
          }))}
        </div>

        {/* WORD LIST & STATUS */}
        <div className="word-list" style={{ minWidth: 220 }}>
          {words.map(w => {
            const foundFlag = found.includes(w.toUpperCase());
            return (
              <div key={w} style={{
                padding: '8px 10px',
                borderRadius: 999,
                marginBottom: 8,
                background: foundFlag ? 'linear-gradient(90deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.04)',
                color: foundFlag ? '#fff' : '#e6e6ea',
                fontWeight: 700
              }}>{w}</div>
            );
          })}
          {found.length === words.length && <div style={{ marginTop: 12, fontWeight: 700, color: '#059669' }}>🎉 You found all words!</div>}
          <div style={{ marginTop: 12, fontWeight: 700 }}>Time: {timeLeft}s</div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#aaa' }}>Tip: drag across letters to select (works on touch & mouse)</div>
        </div>
      </div>
    </div>
  );
}