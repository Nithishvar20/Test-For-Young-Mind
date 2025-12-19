// src/pages/games/ArithmeticA.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

const OPERATORS = { add: "+", sub: "-", mul: "×", div: "÷" };
const TOTAL_QUESTIONS = 15;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeProblem(difficulty, enabledOps) {
  const ops = Object.keys(enabledOps).filter((k) => enabledOps[k]);
  if (ops.length === 0) ops.push("add");

  const op = ops[Math.floor(Math.random() * ops.length)];
  let aRange, bRange;
  switch (difficulty) {
    case "easy":
      aRange = [0, 12];
      bRange = [1, 12];
      break;
    case "medium":
      aRange = [0, 80];
      bRange = [1, 20];
      break;
    default:
      aRange = [0, 300];
      bRange = [1, 50];
  }

  let a = randInt(...aRange),
    b = randInt(...bRange),
    answer;

  if (op === "div") {
    const ansRange = difficulty === "easy" ? [0, 12] : difficulty === "medium" ? [0, 20] : [0, 50];
    answer = randInt(...ansRange);
    b = randInt(Math.max(1, bRange[0]), Math.max(1, bRange[1]));
    a = answer * b;
  } else {
    if (op === "mul") {
      if (difficulty === "easy") {
        a = randInt(0, 12);
        b = randInt(0, 12);
      } else if (difficulty === "medium") {
        a = randInt(0, 20);
        b = randInt(0, 12);
      } else {
        a = randInt(0, 30);
        b = randInt(0, 20);
      }
    }
    if (op === "sub" && a < b) [a, b] = [b, a];
    answer = op === "add" ? a + b : op === "sub" ? a - b : a * b;
  }

  return { a, b, op, answer, text: `${a} ${OPERATORS[op]} ${b}` };
}

export default function ArithmeticA() {
  const nav = useNavigate();

  const [difficulty] = useState("easy");
  const [enabledOps] = useState({ add: true, sub: true, mul: true, div: true });
  const [targetScore] = useState(8);

  const [problem, setProblem] = useState(() => makeProblem(difficulty, enabledOps));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeSec, setTimeSec] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const [qIndex, setQIndex] = useState(0);
  const [popup, setPopup] = useState(null);
  const [finalPopup, setFinalPopup] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const popupTimerRef = useRef(null);
  const finalTimerRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);

  // Start timer immediately when game loads
  useEffect(() => {
    timerRef.current = setInterval(() => setTimeSec((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (score >= targetScore && targetScore > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2200);
    }
  }, [score, targetScore]);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      if (finalTimerRef.current) clearTimeout(finalTimerRef.current);
    };
  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const nextProblem = () => {
    setProblem(makeProblem(difficulty, enabledOps));
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const pickDirection = () => {
    const dirs = ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"];
    return dirs[Math.floor(Math.random() * dirs.length)];
  };

  const showTransientPopup = (type, title, delta) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    const dir = pickDirection();
    const id = Date.now();
    setPopup({ id, dir, type, title, delta });
    popupTimerRef.current = setTimeout(() => setPopup(null), 2000);
  };

  const showFinalAndReturn = (finalScore) => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      setPopup(null);
    }
    setFinalPopup({ score: finalScore, total: TOTAL_QUESTIONS });
    finalTimerRef.current = setTimeout(() => {
      if (finalScore > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1600);
      }
      nav("/games");
    }, 2000);
  };

  const submitAnswer = (e) => {
    e?.preventDefault();
    if (finalPopup) return;
    if (input.trim() === "") return;

    const parsed = Number(input.trim());
    const isCorrect = parsed === problem.answer;

    const newScore = isCorrect ? score + 1 : Math.max(0, score - 1);
    setScore(newScore);

    if (qIndex >= TOTAL_QUESTIONS - 1) {
      showFinalAndReturn(newScore);
      setQIndex((i) => i + 1);
      return;
    }

    if (isCorrect) {
      showTransientPopup("correct", "Correct ✅", "Score +1");
      if (newScore >= targetScore && targetScore > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2200);
      }
    } else {
      showTransientPopup("wrong", "Wrong ❌", "Score -1");
    }

    setQIndex((i) => i + 1);
    setTimeout(nextProblem, isCorrect ? 550 : 1000);
  };

  const appendDigit = (d) => setInput((s) => (s || "") + d);
  const backspace = () => setInput((s) => (s ? s.slice(0, -1) : ""));
  const skipProblem = () => {
    if (finalPopup) return;
    const newScore = Math.max(0, score - 1);
    setScore(newScore);

    if (qIndex >= TOTAL_QUESTIONS - 1) {
      showFinalAndReturn(newScore);
      setQIndex((i) => i + 1);
      return;
    }

    showTransientPopup("wrong", "Skipped ❌", "Score -1");
    setQIndex((i) => i + 1);
    setTimeout(nextProblem, 450);
  };

  const popupVariants = {
    hidden: (dir) => {
      const distance = 80;
      switch (dir) {
        case "top": return { opacity: 0, y: -distance, x: 0, scale: 0.9 };
        case "bottom": return { opacity: 0, y: distance, x: 0, scale: 0.9 };
        case "left": return { opacity: 0, x: -distance, y: 0, scale: 0.9 };
        case "right": return { opacity: 0, x: distance, y: 0, scale: 0.9 };
        case "top-left": return { opacity: 0, x: -distance, y: -distance, scale: 0.88 };
        case "top-right": return { opacity: 0, x: distance, y: -distance, scale: 0.88 };
        case "bottom-left": return { opacity: 0, x: -distance, y: distance, scale: 0.88 };
        case "bottom-right": return { opacity: 0, x: distance, y: distance, scale: 0.88 };
        default: return { opacity: 0, scale: 0.9 };
      }
    },
    visible: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.22 } },
  };

  const keypadButtonStyle = {
    height: 58,
    width: 58,
    borderRadius: 12,
    background: "linear-gradient(180deg,#22262b,#101316)",
    border: "1px solid rgba(255,255,255,0.04)",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "inset 0 2px 6px rgba(255,255,255,0.02), 0 6px 18px rgba(0,0,0,0.45)",
    transition: "transform 140ms cubic-bezier(.2,.9,.2,1), box-shadow 160ms",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "linear-gradient(180deg,#2a0a2e 0%, #0b0614 100%)",
        backgroundAttachment: "fixed",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={220} />}

      {/* Correct/Wrong Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            custom={popup.dir}
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1200,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                minWidth: 160,
                padding: "12px 18px",
                borderRadius: 12,
                color: popup.type === "correct" ? "#05211a" : "#3b0711",
                fontWeight: 800,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(6px) saturate(120%)",
                boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
                background:
                  popup.type === "correct"
                    ? "linear-gradient(90deg,#a7f3d0,#34d399)"
                    : "linear-gradient(90deg,#ffb3c0,#fb7185)",
              }}
            >
              <div style={{ fontSize: 20 }}>{popup.title}</div>
              <div style={{ fontSize: 16 }}>{popup.delta}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Score Popup */}
      <AnimatePresence>
        {finalPopup && (
          <motion.div
            key={"final-" + finalPopup.score}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1300,
            }}
          >
            <div
              style={{
                minWidth: 220,
                padding: "18px 22px",
                borderRadius: 14,
                color: "#fff",
                fontWeight: 900,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
                backdropFilter: "blur(8px) saturate(120%)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
                background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(27,6,29,0.9))",
              }}
            >
              <div style={{ fontSize: 22 }}>Completed</div>
              <div style={{ fontSize: 18, color: "#9ca3af" }}>Final Score</div>
              <div style={{ fontSize: 20 }}>
                {finalPopup.score} / {finalPopup.total}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Panel */}
      <div style={{ width: "100%", maxWidth: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>ArithmeticA</h1>
        </div>

        <div style={{ alignSelf: "flex-start", marginLeft: 100, textAlign: "left" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Score: {score}</div>
          <div style={{ fontSize: 14, marginTop: 4, color: "rgba(255,255,255,0.8)" }}>
            Time: {formatTime(timeSec)}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 560,
            padding: "16px 18px",
            borderRadius: 14,
            background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06))",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5), inset 0 2px 6px rgba(255,255,255,0.02)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{problem.text}</div>

          <form onSubmit={submitAnswer} style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <input
              ref={inputRef}
              value={input}
              readOnly
              placeholder="Answer"
              style={{
                width: 140,
                fontSize: 20,
                padding: "8px 10px",
                textAlign: "center",
                borderRadius: 10,
                border: "2px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.02)",
                color: "#fff",
              }}
            />
            <button
              type="submit"
              disabled={!!finalPopup}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "linear-gradient(90deg,#ffd166,#ff9f1c)",
                border: "none",
                fontWeight: 800,
                color: "#06121b",
                cursor: finalPopup ? "not-allowed" : "pointer",
              }}
            >
              Submit
            </button>
          </form>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => appendDigit(String(n))} style={keypadButtonStyle} disabled={!!finalPopup}>
              {n}
            </button>
          ))}
          <button onClick={skipProblem} style={{ ...keypadButtonStyle, background: "linear-gradient(90deg,#7dd3fc,#4cc9f0)", color: "#06121b" }} disabled={!!finalPopup}>
            Skip
          </button>
          <button onClick={() => appendDigit("0")} style={keypadButtonStyle} disabled={!!finalPopup}>
            0
          </button>
          <button onClick={backspace} style={keypadButtonStyle} disabled={!!finalPopup}>
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}