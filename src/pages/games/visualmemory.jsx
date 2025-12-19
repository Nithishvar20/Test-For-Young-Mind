// src/pages/games/VisualMemory4x3.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useTheme } from "../../state/ThemeContext"; // <-- added to use the app theme

export default function VisualMemory4x3() {
  const { themeCss } = useTheme?.() || {}; // safe access if ThemeProvider isn't present

  const SYMBOLS = ["🍎", "🍌", "🍇", "🍒", "🥝", "🏛️"];

  function shuffleArray(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function makeDeck() {
    return shuffleArray(
      SYMBOLS.flatMap((s, i) => [
        { id: `${i}-A`, symbol: s, flipped: false, matched: false },
        { id: `${i}-B`, symbol: s, flipped: false, matched: false },
      ])
    );
  }

  const [cards, setCards] = useState(() => makeDeck());
  const [flipped, setFlipped] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [showPoppers, setShowPoppers] = useState(false);

  const timerRef = useRef(null);

  const [tileSize, setTileSize] = useState(110);
  const headerTopOffset = 74;

  useEffect(() => {
    function measure() {
      const vw = Math.min(window.innerWidth, 1200);
      const vh = window.innerHeight;
      const boardTarget = Math.min(640, Math.round(Math.min(vw * 0.52, vh * 0.58)));
      const gap = Math.max(12, Math.round(boardTarget * 0.04));
      const tile = Math.floor((boardTarget - gap * 3) / 4);
      setTileSize(Math.max(96, tile + 12));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ---------- Timer effect ---------- */
  useEffect(() => {
    if (running && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    if (!running && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setWon(true);
      setRunning(false); // stop timer when all matched
      setShowPoppers(true); // trigger poppers
    }
  }, [cards]);

  const restart = (reshuffle = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setWon(false);
    setShowPoppers(false);
    setFlipped([]);
    setLocked(false);
    setMoves(0);
    setSeconds(0);
    setCards(
      reshuffle
        ? makeDeck()
        : cards.map((c) => ({ ...c, flipped: false, matched: false }))
    );
  };

  const handleFlip = (id) => {
    if (locked || won) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    if (!running) setRunning(true);

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );
    const next = [...flipped, id].slice(0, 2);
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      setTimeout(() => checkPair(next[0], next[1]), 600);
    }
  };

  const checkPair = (aId, bId) => {
    setCards((prev) => {
      const a = prev.find((c) => c.id === aId);
      const b = prev.find((c) => c.id === bId);
      if (a && b && a.symbol === b.symbol) {
        return prev.map((c) =>
          c.id === aId || c.id === bId
            ? { ...c, matched: true, flipped: true }
            : c
        );
      } else {
        return prev.map((c) =>
          c.id === aId || c.id === bId ? { ...c, flipped: false } : c
        );
      }
    });
    setFlipped([]);
    setLocked(false);
  };

  const formatTime = () => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const COLS = 4,
    ROWS = 3;
  const GAP = Math.max(10, Math.round(tileSize * 0.06));
  const gridWidth = tileSize * COLS + GAP * (COLS - 1);
  const cardPadding = 20;
  const containerWidth = gridWidth + cardPadding * 2;

  const cardVariants = { down: { rotateY: 0 }, up: { rotateY: 180 } };

  const POPPERS = ["🎈", "🎉", "✨", "🎊", "🎁", "🥳", "👏"];
  const popperItems = POPPERS.map((emoji, i) => {
    const left = 8 + Math.round((i / POPPERS.length) * 84);
    const delay = (i % 6) * 0.08 + Math.floor(i / 6) * 0.18;
    const size = 20 + (i % 4) * 6;
    return { emoji, left, delay, size };
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: themeCss || "linear-gradient(180deg,#2a0a2e 0%, #0b0614 100%)", // <- themed background
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
        padding: 12,
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {won && <Confetti recycle={false} numberOfPieces={180} />}

      {showPoppers && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 120,
            overflow: "hidden",
          }}
        >
          <style>{`
            @keyframes popperFall {
              0% { transform: translateY(-18vh) scale(0.85); opacity: 0; }
              15% { opacity: 1; }
              80% { transform: translateY(70vh) scale(1); opacity: 1; }
              100% { transform: translateY(110vh) scale(1.08); opacity: 0; }
            }
          `}</style>

          {popperItems.map((p, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: `${p.left}%`,
                top: -40,
                fontSize: p.size,
                transform: "translateX(-50%)",
                animation: `popperFall 1.9s cubic-bezier(.18,.9,.32,1) ${p.delay}s both`,
                textShadow: "0 6px 16px rgba(0,0,0,0.45)",
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.45))",
              }}
            >
              {p.emoji}
            </div>
          ))}
        </div>
      )}

      <div style={{ height: headerTopOffset }} />

      <header style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: 28 }}>Visual Memory</h1>
      </header>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          maxWidth: containerWidth,
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => restart(true)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            background: "linear-gradient(90deg,#ffd166,#ff9f1c)",
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            color: "#06121b",
            cursor: "pointer",
          }}
        >
          Shuffle
        </button>

        <button
          onClick={() => restart(false)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Restart
        </button>

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            Moves: {moves}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{`Time: ${formatTime()}`}</div>
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          width: containerWidth,
          padding: cardPadding,
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(8,12,20,0.75), rgba(20,26,33,0.75))",
          boxShadow: "0 30px 90px rgba(2,6,23,0.6), inset 0 4px 12px rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.03)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: gridWidth,
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${tileSize}px)`,
            gap: GAP,
          }}
        >
          <AnimatePresence initial={false}>
            {cards.map((c) => {
              const faceUp = c.flipped || c.matched;
              return (
                <motion.button
                  key={c.id}
                  onClick={() => handleFlip(c.id)}
                  disabled={locked || c.flipped || c.matched}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    perspective: 1000,
                    borderRadius: 14,
                    border: "none",
                    background: "transparent",
                    cursor: faceUp ? "default" : "pointer",
                  }}
                  whileHover={{ scale: !faceUp ? 1.03 : 1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <motion.div
                    variants={cardVariants}
                    animate={faceUp ? "up" : "down"}
                    transition={{ duration: 0.42 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transformStyle: "preserve-3d",
                      borderRadius: 14,
                    }}
                  >
                    {/* back */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        backfaceVisibility: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg,#f97316,#ec4899)",
                        color: "#fff",
                        fontSize: Math.max(20, Math.round(tileSize * 0.22)),
                        fontWeight: 700,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
                      }}
                    >
                      ❓
                    </div>
                    {/* front */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: Math.max(28, Math.round(tileSize * 0.38)),
                        background: c.matched
                          ? "linear-gradient(135deg,#06b6d4,#3b82f6)"
                          : "#fef9c3",
                        color: c.matched ? "#fff" : "#111827",
                        boxShadow: c.matched
                          ? "0 0 20px rgba(6,182,212,0.7)"
                          : "0 6px 14px rgba(0,0,0,0.25)",
                      }}
                    >
                      {c.symbol}
                    </div>
                  </motion.div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}