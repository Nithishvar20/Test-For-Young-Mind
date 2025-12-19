// src/components/biology/AnagramScramble.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Upgraded Anagram Scramble — with clue sentences
 * File: src/components/biology/AnagramScramble.jsx
 *
 * Touch/keyboard friendly, animated UI, radial timer, levels, best score (localStorage).
 * Shows a clue sentence describing the target word above the answer box.
 */

// ------------ Word list & clues ------------
const ALL_WORDS = [
  "cell", "gene", "dna", "atom", "tissue",
  "enzyme", "mitosis", "chromosome", "nucleus", "ribosome",
  "mitochondria", "photosynthesis", "chloroplast", "homeostasis",
  "respiration", "macromolecule", "transcription", "translation",
];

const CLUES = {
  cell: "The basic structural and functional unit of life.",
  gene: "A unit of heredity made of DNA that influences traits.",
  dna: "Molecule that stores genetic instructions for organisms.",
  atom: "The smallest unit of ordinary matter that forms chemical elements.",
  tissue: "A group of similar cells that work together to perform a function.",
  enzyme: "A protein that speeds up (catalyzes) chemical reactions.",
  mitosis: "Cell division process producing two identical daughter cells.",
  chromosome: "Thread-like structure of DNA and proteins carrying genes.",
  nucleus: "The control center of a cell where DNA is stored.",
  ribosome: "Cell structure where proteins are synthesized.",
  mitochondria: "Organelles known as the powerhouse of the cell (ATP production).",
  photosynthesis: "Process by which plants convert sunlight into chemical energy.",
  chloroplast: "Green organelle in plant cells where photosynthesis occurs.",
  homeostasis: "The ability of an organism to maintain internal stability.",
  respiration: "Cellular process of extracting energy from glucose.",
  macromolecule: "A very large molecule (like proteins, nucleic acids, carbs).",
  transcription: "First step of gene expression: DNA is copied into RNA.",
  translation: "Process of decoding RNA to assemble proteins.",
};

// ------------ Levels & helpers ------------
const LEVELS = [
  { time: 45, count: 3 },
  { time: 50, count: 4 },
  { time: 60, count: 5 },
  { time: 75, count: 6 },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffleArray = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickWordsForLevel = (levelIndex) => {
  const count = LEVELS[Math.min(levelIndex, LEVELS.length - 1)].count;
  // prefer longer words as level increases
  const pool = ALL_WORDS.filter((w) => w.length >= Math.max(3, 3 + Math.floor(levelIndex / 1)));
  return shuffleArray(pool).slice(0, count);
};

// ---------------------- Component ----------------------
export default function AnagramScramble() {
  // state: level / words / round
  const [levelIndex, setLevelIndex] = useState(0);
  const [words, setWords] = useState(() => pickWordsForLevel(0));
  const [currentIndex, setCurrentIndex] = useState(0);

  // tiles & input
  const [tiles, setTiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [input, setInput] = useState("");

  // gameplay
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("anagram_best") || 0));

  // feedback & hints
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout' | null
  const [hintsUsed, setHintsUsed] = useState(0);

  const timerRef = useRef(null);
  const btnLockRef = useRef(false);

  // init tiles when word/level changes
  useEffect(() => {
    const w = words[currentIndex] || words[0];
    if (!w) return;
    const arr = w.split("").map((ch, i) => ({ ch: ch.toUpperCase(), id: `${ch}-${i}-${Math.random().toString(36).slice(2, 6)}`, used: false }));
    setTiles(shuffleArray(arr));
    setSelectedIds([]);
    setInput("");
    setFeedback(null);
    setHintsUsed(0);
    setTimeLeft(LEVELS[Math.min(levelIndex, LEVELS.length - 1)].time);
    setRunning(true);
  }, [currentIndex, words, levelIndex]);

  // countdown timer
  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setRunning(false);
          setFeedback("timeout");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, currentIndex]);

  // keyboard support
  useEffect(() => {
    function onKey(e) {
      const k = e.key;
      if (/^[a-zA-Z]$/.test(k)) {
        pickLetterByChar(k.toUpperCase());
        return;
      }
      if (k === "Backspace") {
        handleBackspace();
        return;
      }
      if (k === "Enter") {
        handleSubmit();
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, selectedIds, input]);

  function pickLetterByChar(ch) {
    const tile = tiles.find((t) => !t.used && t.ch === ch);
    if (tile) pickTile(tile.id);
  }

  function pickTile(id) {
    if (btnLockRef.current || !running) return;
    const tile = tiles.find((t) => t.id === id);
    if (!tile || tile.used) return;
    setTiles((prev) => prev.map((p) => (p.id === id ? { ...p, used: true } : p)));
    setSelectedIds((s) => [...s, id]);
    setInput((s) => s + tile.ch);
    if (navigator.vibrate) navigator.vibrate(8);
  }

  function handleBackspace() {
    if (!selectedIds.length || !running) return;
    const lastId = selectedIds[selectedIds.length - 1];
    setSelectedIds((s) => s.slice(0, -1));
    setTiles((prev) => prev.map((p) => (p.id === lastId ? { ...p, used: false } : p)));
    setInput((s) => s.slice(0, -1));
  }

  function handleClear() {
    if (!running) return;
    setSelectedIds([]);
    setTiles((prev) => prev.map((p) => ({ ...p, used: false })));
    setInput("");
  }

  function handleShuffle() {
    if (!running) return;
    setTiles((prev) => shuffleArray(prev.map((t) => ({ ...t }))));
  }

  function handleHint() {
    if (hintsUsed >= 2 || !running) return;
    const sol = (words[currentIndex] || "").toUpperCase();
    const nextPos = input.length;
    if (nextPos >= sol.length) return;
    const needed = sol[nextPos];
    const tile = tiles.find((t) => !t.used && t.ch === needed);
    if (tile) {
      setHintsUsed((h) => h + 1);
      pickTile(tile.id);
    } else {
      // fallback: clear and try again shortly
      handleClear();
      setTimeout(() => {
        const t2 = tiles.find((t) => !t.used && t.ch === needed);
        if (t2) pickTile(t2.id);
      }, 140);
    }
  }

  function handleSubmit() {
    if (btnLockRef.current || !running) return;
    btnLockRef.current = true;
    setTimeout(() => (btnLockRef.current = false), 300);

    const attempt = input.trim().toUpperCase();
    const target = (words[currentIndex] || "").toUpperCase();
    if (!attempt) {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
      return;
    }

    if (attempt === target) {
      setFeedback("correct");
      const gained = Math.max(10, target.length * 6) + Math.floor(timeLeft / 2);
      setScore((s) => s + gained);
      // show definition/learning card for a moment
      setTimeout(() => {
        if (currentIndex + 1 < words.length) {
          setCurrentIndex((i) => i + 1);
        } else {
          const next = Math.min(levelIndex + 1, LEVELS.length - 1);
          setLevelIndex(next);
          const newWords = pickWordsForLevel(next);
          setWords(newWords);
          setCurrentIndex(0);
        }
        setFeedback(null);
      }, 900);

      // update best
      setTimeout(() => {
        setBest((b) => {
          const nb = Math.max(b, score + gained);
          localStorage.setItem("anagram_best", nb.toString());
          return nb;
        });
      }, 300);
    } else {
      setFeedback("wrong");
      setScore((s) => Math.max(0, s - Math.max(1, Math.floor(target.length / 2))));
      setTimeLeft((t) => Math.max(6, t - 7));
      setTimeout(() => {
        setFeedback(null);
        handleClear();
      }, 800);
    }
  }

  useEffect(() => {
    if (timeLeft === 0) {
      setRunning(false);
      setFeedback("timeout");
    }
  }, [timeLeft]);

  function resetAll() {
    setLevelIndex(0);
    const newWords = pickWordsForLevel(0);
    setWords(newWords);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(LEVELS[0].time);
    setRunning(true);
    setFeedback(null);
    setTiles([]);
    setSelectedIds([]);
    setInput("");
  }

  // UI helpers
  const currentWord = words[currentIndex] || "";
  const percent = Math.max(0, (timeLeft / LEVELS[Math.min(levelIndex, LEVELS.length - 1)].time) * 100);

  // floating bubbles background
  const bubbles = useMemo(() => new Array(10).fill(0).map((_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 80,
    size: 18 + Math.random() * 60,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 12,
    opacity: 0.06 + Math.random() * 0.16,
  })), []);

  const gridCols = Math.min(8, Math.max(4, tiles.length || 6));

  return (
    <div style={styles.root}>
      {/* background bubbles + watermark */}
      <div style={styles.bg}>
        {bubbles.map((b, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              opacity: b.opacity,
            }}
          />
        ))}
        <div style={styles.dnaWatermark} aria-hidden />
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>🔬 Bio Scramble</div>
            <div style={styles.subtitle}>Form the biology word from the glowing tiles</div>
          </div>

          <div style={styles.topStats}>
            <div style={styles.statCard}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Level</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{levelIndex + 1}</div>
            </div>

            <div style={styles.statCard}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Score</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{score}</div>
            </div>

            <div style={styles.statCard}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Best</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{best}</div>
            </div>
          </div>
        </div>

        <div style={styles.contentGrid}>
          {/* main */}
          <div style={styles.mainCard}>
            <div style={styles.mainTop}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setRunning((r) => !r)} style={styles.iconBtn}>{running ? "⏸" : "▶"}</button>
                <button onClick={handleShuffle} style={styles.iconBtn}>🔀</button>
                <button onClick={handleHint} style={{ ...styles.iconBtn, opacity: hintsUsed >= 2 ? 0.5 : 1 }} disabled={hintsUsed >= 2}>💡</button>
                <button onClick={resetAll} style={{ ...styles.iconBtn, background: "#2a1a2e" }}>⟲</button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 84, height: 84 }}>
                  <RadialTimer percent={percent} seconds={timeLeft} />
                </div>
              </div>
            </div>

            {/* CLUE BOX */}
            <div style={{
              background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(0,0,0,0.06))",
              padding: "10px 14px",
              borderRadius: 12,
              marginTop: 14,
              fontSize: 15,
              textAlign: "center",
              color: "rgba(255,255,255,0.9)"
            }}>
              {feedback === "correct"
                ? `Correct — ${CLUES[currentWord.toLowerCase()] || "Nice work!"}`
                : CLUES[currentWord.toLowerCase()] || "Unscramble the biology term"}
            </div>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={feedback ? feedback : "word-display"}
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  style={{
                    ...styles.answerBox,
                    ...(feedback === "correct" ? styles.answerCorrect : {}),
                    ...(feedback === "wrong" ? styles.answerWrong : {}),
                    ...(feedback === "timeout" ? styles.answerTimeout : {}),
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800 }}>
                    {input || <span style={{ color: "rgba(255,255,255,0.45)" }}>Tap letters to form the word</span>}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 12 }}>
                {tiles.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => pickTile(t.id)}
                    whileTap={{ scale: t.used ? 1 : 0.96 }}
                    animate={t.used ? { scale: 0.96, opacity: 0.55 } : { scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    disabled={t.used || !running}
                    style={{
                      ...styles.tile,
                      background: t.used ? "rgba(255,255,255,0.04)" : "linear-gradient(180deg,#60a5fa,#2563eb)",
                      boxShadow: t.used ? "none" : "0 10px 30px rgba(37,99,235,0.16)",
                      cursor: t.used ? "default" : "pointer",
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{t.ch}</div>
                  </motion.button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
                <button onClick={handleBackspace} style={styles.actionBtn}>←</button>
                <button onClick={handleClear} style={styles.actionBtn}>Clear</button>
                <button onClick={handleSubmit} style={{ ...styles.actionBtn, background: "linear-gradient(90deg,#34d399,#10b981)" }}>Submit</button>
              </div>
            </div>
          </div>

          {/* side */}
          <aside style={styles.sideCard}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Round Info</div>

            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Word length</div>
              <div style={styles.infoValue}>{currentWord.length}</div>
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Hints left</div>
              <div style={styles.infoValue}>{Math.max(0, 2 - hintsUsed)}</div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 800 }}>Words this level</div>
              <div style={{ marginTop: 8 }}>
                {words.map((w, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: i === currentIndex ? "rgba(255,255,255,0.04)" : "transparent", marginBottom: 8 }}>
                    <div style={{ color: "rgba(255,255,255,0.9)" }}>#{i + 1}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)" }}>{w.length} letters</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800 }}>How to play</div>
              <ol style={{ marginTop: 8, marginLeft: 18 }}>
                <li>Tap tiles to spell the target word.</li>
                <li>Use hint to reveal a letter (max 2 / round).</li>
                <li>Submit when ready. Faster solves award more points.</li>
              </ol>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button onClick={handleShuffle} style={styles.smallBtn}>Shuffle</button>
              <button onClick={() => { const prev = Math.max(0, levelIndex - 1); setLevelIndex(prev); setWords(pickWordsForLevel(prev)); setCurrentIndex(0); }} style={styles.smallBtn}>-L</button>
              <button onClick={() => { const next = Math.min(levelIndex + 1, LEVELS.length - 1); setLevelIndex(next); setWords(pickWordsForLevel(next)); setCurrentIndex(0); }} style={styles.smallBtn}>+L</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ---------------- Radial timer ----------------
function RadialTimer({ percent = 100, seconds = 0 }) {
  const size = 84;
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const dash = (percent / 100) * circumference;
  const rem = circumference - dash;
  const col = percent > 60 ? "#34d399" : percent > 30 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox="0 0 84 84" style={{ display: "block" }}>
      <defs>
        <linearGradient id="gradTimer" x1="0" x2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <g transform="translate(42,42)">
        <circle r={r} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
        <circle
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          r={r}
          fill="none"
          stroke="url(#gradTimer)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${rem}`}
          strokeDashoffset={0.25 * circumference}
          transform="rotate(-90)"
        />
        <text x="0" y="5" textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: "#fff" }}>
          {seconds}s
        </text>
      </g>
    </svg>
  );
}

// ---------------- Styles ----------------
const styles = {
  root: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    background: "linear-gradient(180deg,#071426,#041022)",
    color: "#fff",
    paddingBottom: 48,
  },
  bg: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  bubble: {
    position: "absolute",
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
    filter: "blur(6px)",
    transform: "translateY(0)",
    animationName: "floaty",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  dnaWatermark: {
    position: "absolute",
    right: "-10%",
    top: "10%",
    width: "60%",
    height: "80%",
    backgroundImage:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.02), transparent 20%), repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0 6px, transparent 6px 12px)",
    transform: "rotate(-12deg)",
    opacity: 0.12,
    mixBlendMode: "overlay",
  },
  container: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1200,
    margin: "0 auto",
    paddingTop: 80,
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 },
  title: { fontSize: 28, fontWeight: 900, letterSpacing: 0.2 },
  subtitle: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  topStats: { display: "flex", gap: 12, alignItems: "center" },
  statCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    padding: "10px 12px",
    borderRadius: 10,
    textAlign: "center",
    minWidth: 78,
  },

  contentGrid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, marginTop: 18 },
  mainCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06))",
    borderRadius: 14,
    padding: 18,
    minHeight: 420,
    boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
  },
  mainTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  answerBox: {
    padding: "14px 20px",
    borderRadius: 14,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.04)",
    minWidth: 360,
    textAlign: "center",
  },
  answerCorrect: { background: "linear-gradient(90deg,#a7f3d0,#22c55e)", color: "#062014", boxShadow: "0 12px 36px rgba(34,197,94,0.12)" },
  answerWrong: { background: "linear-gradient(90deg,#fecaca,#ef4444)", color: "#2a0b07", boxShadow: "0 12px 36px rgba(239,68,68,0.12)" },
  answerTimeout: { background: "linear-gradient(90deg,#fde68a,#f97316)", color: "#2a1606" },

  tile: {
    height: 72,
    borderRadius: 12,
    border: "none",
    fontSize: 22,
    fontWeight: 900,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  sideCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06))",
    borderRadius: 12,
    padding: 14,
    minHeight: 420,
  },

  infoRow: { display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" },
  infoLabel: { color: "rgba(255,255,255,0.7)" },
  infoValue: { fontWeight: 900 },

  iconBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  smallBtn: { padding: "8px 12px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontWeight: 800, cursor: "pointer" },
};

// inject keyframes (floating bubbles) once
const injectedKeyframes = `
@keyframes floaty {
  0% { transform: translateY(0) translateX(0) scale(1); }
  50% { transform: translateY(-18px) translateX(6px) scale(1.06); }
  100% { transform: translateY(0) translateX(0) scale(1); }
}
`;
if (typeof document !== "undefined") {
  const id = "__anagram_bio_keyframes__";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.innerHTML = injectedKeyframes;
    document.head.appendChild(s);
  }
}