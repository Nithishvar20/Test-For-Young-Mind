// src/pages/RiddlesGame.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RiddlesGame.jsx
 * - 15 riddles, pick 6 randomly
 * - improved visuals, animated confetti, progress ring, hints, tries/score
 * - self-contained: inline styles + a small canvas confetti implementation
 */

// ----- RIDDLES -----
const ALL_RIDDLES = [
  { q: "Who wears shoes while sleeping?", a: "horse", hint: "🐎 It's an animal people sometimes ride." },
  { q: "You see me once in June, twice in November, but not at all in May. What am I?", a: "e", hint: "Think about letters." },
  { q: "The more of me you take, the more you leave behind. What am I?", a: "footsteps", hint: "👣 Walking leaves me behind." },
  { q: "What has keys but can't open locks?", a: "piano", hint: "🎹 It makes music." },
  { q: "I’m tall when I’m young, and short when I’m old. What am I?", a: "candle", hint: "🕯️ I give light." },
  { q: "What gets wetter the more it dries?", a: "towel", hint: "You use it after a bath." },
  { q: "What has a face and two hands but no arms or legs?", a: "clock", hint: "⏰ It tells time." },
  { q: "What has a head and a tail but no body?", a: "coin", hint: "💰 You flip me." },
  { q: "I speak without a mouth and hear without ears. What am I?", a: "echo", hint: "🔊 Mountains give me back." },
  { q: "The more you take away, the bigger I get. What am I?", a: "hole", hint: "🕳️ You dig me." },
  { q: "What has to be broken before you can use it?", a: "egg", hint: "🍳 Breakfast food." },
  { q: "What has many teeth but cannot bite?", a: "comb", hint: "You use me for your hair." },
  { q: "What goes up but never comes down?", a: "age", hint: "🎂 Each year it increases." },
  { q: "What has one eye but cannot see?", a: "needle", hint: "🧵 Tailors use me." },
  { q: "I’m always running but never move. What am I?", a: "time", hint: "⌛ It never stops." },
];

// ----- UTIL -----
function pickN(arr, n) {
  return arr
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, n);
}

// ----- CONFETTI (simple canvas particle burst) -----
function useConfetti() {
  const ref = useRef(null);
  const ctxRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    let raf;
    const frame = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      const pts = particlesRef.current;
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        const age = (now - p.t0) / p.life;
        if (age >= 1) { pts.splice(i, 1); continue; }
        p.vy += 0.06; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = 1 - age;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function burst(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 40) {
    const colors = ["#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#9D4EDD", "#FFB4A2"];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        x: x + (Math.random()-0.5)*40,
        y: y + (Math.random()-0.5)*20,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - (1 + Math.random()*2),
        vr: (Math.random() - 0.5) * 0.2,
        rot: Math.random() * Math.PI,
        sz: 6 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        t0: now,
        life: 800 + Math.random() * 900,
      });
    }
  }

  return { canvasRef: ref, burst };
}

// ----- MAIN COMPONENT -----
export default function RiddlesGame() {
  const [pool, setPool] = useState(() => pickN(ALL_RIDDLES, 6));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [triesLeft, setTriesLeft] = useState(6); // changed to 6
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | "finished"
  const [justBurst, setJustBurst] = useState(false);
  const confetti = useConfetti();
  const inputRef = useRef(null);

  useEffect(() => {
    // focus input on question change
    inputRef.current?.focus();
  }, [idx, pool]);

  // Submit handler
  function submitAnswer(e) {
    e && e.preventDefault();
    if (!input.trim()) return;
    const answer = input.trim().toLowerCase();
    const correct = pool[idx].a.toLowerCase();
    if (answer === correct) {
      // correct
      setScore((s) => s + 10);
      setFeedback("correct");
      confetti.burst(window.innerWidth/2, window.innerHeight/3, 45);
      setJustBurst(true);
      setTimeout(()=> setJustBurst(false), 800);
      setTimeout(() => {
        if (idx + 1 >= pool.length) {
          setFeedback("finished");
          confetti.burst(window.innerWidth/2, window.innerHeight/3, 120);
        } else {
          setIdx((i) => i + 1);
          setInput("");
          setShowHint(false);
          setFeedback(null);
        }
      }, 900);
    } else {
      // wrong
      setFeedback("wrong");
      setTriesLeft((t) => Math.max(0, t - 1));
      confetti.burst(window.innerWidth/2, window.innerHeight/3, 8);
      setTimeout(() => setFeedback(null), 900);
      // if no tries left -> end
      setTimeout(() => {
        if (triesLeft - 1 <= 0) setFeedback("finished");
      }, 1000);
    }
  }

  // skip question
  function skipQuestion() {
    setIdx((i) => Math.min(pool.length - 1, i + 1));
    setInput("");
    setShowHint(false);
    setFeedback(null);
  }

  // restart
  function restart() {
    setPool(pickN(ALL_RIDDLES, 6));
    setIdx(0);
    setInput("");
    setScore(0);
    setTriesLeft(6); // reset to 6
    setShowHint(false);
    setFeedback(null);
  }

  // nice animated progress fraction
  const percent = Math.round(((idx) / pool.length) * 100);

  // Styles (inline for single-file convenience)
  const styles = {
    page: {
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.06), transparent 6%), linear-gradient(180deg,#071129 0%, #0b1220 100%)",
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      color: "#f7f7fb",
      padding: 30,
    },
    card: {
      width: "min(920px, 96%)",
      borderRadius: 18,
      padding: "28px 34px",
      background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
      boxShadow: "0 20px 60px rgba(2,6,23,0.7), inset 0 1px 0 rgba(255,255,255,0.02)",
      position: "relative",
      overflow: "hidden",
    },
    headerRow: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 12,
    },
    title: { fontSize: 18, fontWeight: 800, letterSpacing: 0.2, flex: 1 },
    littleStat: {
      background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.03)",
      fontWeight: 700,
      fontSize: 13,
      display: "flex",
      gap: 10,
      alignItems: "center",
    },
    questionBox: {
      marginTop: 8,
      textAlign: "center",
      padding: 20,
    },
    qText: { fontSize: 22, fontWeight: 800, lineHeight: 1.15, marginBottom: 18, color: "rgba(255,255,255,0.96)" },
    formRow: { display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    input: { flex: 1, padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 16, outline: "none", minWidth: 220 },
    submit: {
      padding: "12px 16px",
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
      color: "#061123",
      fontWeight: 800,
      background: "linear-gradient(90deg,#7c3aed,#60a5fa)",
      boxShadow: "0 10px 30px rgba(99,102,241,0.14), 0 3px 8px rgba(96,165,250,0.08)",
    },
    hintPill: {
      marginTop: 6,
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.04)",
      background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      fontSize: 14,
      color: "#bfe0ff",
      cursor: "pointer",
    },
    footerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      color: "rgba(255,255,255,0.66)",
      fontSize: 13,
    },
    progressBarBg: { height: 8, background: "rgba(255,255,255,0.03)", borderRadius: 999, overflow: "hidden" },
    progressBarFg: (w) => ({ width: `${w}%`, height: "100%", background: "linear-gradient(90deg,#ffd166,#ef476f)", transition: "width 420ms cubic-bezier(.2,.9,.2,1)" }),
    smallButton: { background: "transparent", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 13 },
    centerHUD: { display: "flex", gap: 12, alignItems: "center" },
    ringWrap: { width: 56, height: 56, display: "grid", placeItems: "center", borderRadius: 999, background: "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.06), transparent 30%)" },
    ring: { width: 48, height: 48 },
  };

  const current = pool[idx];

  // keyboard submit on Enter
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter") submitAnswer();
      if (e.key === "Escape") setShowHint(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [input, idx, pool, triesLeft]);

  return (
    <div style={styles.page}>
      {/* confetti canvas */}
      <canvas ref={confetti.canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 80 }} />

      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 14 }}
        style={styles.card}
      >
        {/* Header */}
        <div style={styles.headerRow}>
          <div style={styles.title}>Playful Riddles — Think & Learn</div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={styles.littleStat}>⭐ Score <span style={{ marginLeft: 8, color: "#fff" }}>{score}</span></div>
            <div style={styles.littleStat}>🔁 Tries <span style={{ marginLeft: 8, color: "#fff" }}>{triesLeft}</span></div>
            <div style={styles.littleStat}>Q {idx + 1}/{pool.length}</div>
          </div>
        </div>

        {/* Decorative top accent */}
        <div style={{ position: "absolute", top: -60, right: -80, width: 240, height: 240, borderRadius: 999, background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(124,58,237,0.04))", filter: "blur(40px)", pointerEvents: "none" }} />

        {/* Question */}
        <div style={styles.questionBox}>
          <motion.div
            key={current.q + idx}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <div style={styles.qText}>{current.q}</div>

            <form onSubmit={(e) => { e.preventDefault(); submitAnswer(); }} style={styles.formRow} aria-label="Answer form">
              <input
                ref={inputRef}
                style={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                aria-label="Answer"
                autoComplete="off"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.preventDefault(); submitAnswer(); }}
                style={styles.submit}
                aria-label="Submit answer"
              >
                Submit
              </motion.button>
            </form>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center", marginBottom: 6 }}>
              <button onClick={() => setShowHint((s) => !s)} style={styles.hintPill} aria-expanded={showHint}>
                💡 {showHint ? "Hide hint" : "Show hint"}
              </button>

              <div style={{ color: "rgba(255,255,255,0.55)" }}>{/* spacer */}</div>

              <div style={styles.centerHUD}>
                <div style={styles.ringWrap}>
                  <svg viewBox="0 0 36 36" style={styles.ring}>
                    <path stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831" />
                    <motion.path
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - (idx / pool.length) * 100 }}
                      transition={{ duration: 0.6 }}
                      stroke="url(#g1)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831"
                    />
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0%" stopColor="#ffd166" />
                        <stop offset="100%" stopColor="#ef476f" />
                      </linearGradient>
                    </defs>
                    <text x="18" y="20" textAnchor="middle" fontSize="6" fill="#fff" style={{ fontWeight: 800 }}>{idx}/{pool.length}</text>
                  </svg>
                </div>
              </div>
            </div>

            {showHint && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10, color: "#dbeafe", background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.03)" }}>
                <strong style={{ marginRight: 8 }}>Hint</strong> {current.hint}
              </motion.div>
            )}
          </motion.div>

          {/* Feedback overlays */}
          <AnimatePresence>
            {feedback === "correct" && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 160, damping: 14 }} style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "linear-gradient(90deg,#16a34a,#34d399)", padding: "10px 18px", borderRadius: 12, fontWeight: 800, color: "#062018", boxShadow: "0 10px 30px rgba(34,197,94,0.12)" }}>
                  ✅ Nice! +10 pts
                </div>
              </motion.div>
            )}
            {feedback === "wrong" && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 160, damping: 14 }} style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "linear-gradient(90deg,#ef4444,#f97316)", padding: "10px 18px", borderRadius: 12, fontWeight: 800, color: "#fff", boxShadow: "0 10px 30px rgba(239,68,68,0.12)" }}>
                  ❌ Not quite — try again
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={styles.footerRow}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={skipQuestion} style={styles.smallButton}>Skip</button>
            <button onClick={() => { /* pretend home route */ restart(); }} style={styles.smallButton}>Home</button>
          </div>

          <div style={{ width: 260 }}>
            <div style={styles.progressBarBg}>
              <div style={styles.progressBarFg(Math.round(((idx) / pool.length) * 100))} />
            </div>
          </div>

          <div style={{ textAlign: "right", color: "rgba(255,255,255,0.6)" }}>
            Tip: Press <kbd style={{ background: "rgba(255,255,255,0.03)", padding: "3px 6px", borderRadius: 6 }}>Enter</kbd> to submit
          </div>
        </div>

        {/* End modal */}
        <AnimatePresence>
          {feedback === "finished" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 70 }}>
              <motion.div initial={{ y: 30 }} animate={{ y: 0 }} style={{
                width: "min(540px, 92%)",
                /* changed: make result card a different colorful gradient */
                background: "linear-gradient(90deg,#60a5fa 0%, #7c3aed 100%)",
                borderRadius: 16,
                padding: 26,
                textAlign: "center",
                boxShadow: "0 40px 120px rgba(2,6,23,0.7)"
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "#fff" }}>🎉 Well done!</div>
                <div style={{ marginBottom: 18, color: "rgba(255,255,255,0.95)" }}>You finished the quiz. Final score: <strong>{score}</strong></div>

                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={restart} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: "linear-gradient(90deg,#ffd166,#ef476f)", color: "#062018", fontWeight: 900 }}>
                    Play Again
                  </button>
                  {/* Home button removed as requested */}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}