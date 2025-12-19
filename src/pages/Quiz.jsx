// src/pages/Quiz.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../state/ThemeContext"; // reads current theme

function shuffle(a) {
  return a.slice().sort(() => Math.random() - 0.5);
}

function playTone(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = type === "good" ? "sine" : "square";
    o.frequency.value = type === "good" ? 880 : 220;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.value = 0.0001;
    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    o.start(now);
    o.stop(now + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  } catch (e) {
    // audio may be blocked in some environments
  }
}

export default function Quiz() {
  const timeoutRef = useRef(null);
  const timerRef = useRef(null);
  const surpriseTimeoutRef = useRef(null);

  const { grade = "6", subject = "english", level = "easy" } = useParams();
  const navigate = useNavigate();

  const { theme } = useTheme(); // read current theme

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // "good" | "bad" | null
  const [timeLeft, setTimeLeft] = useState(10);

  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Surprise modal + streak prompts
  const [surpriseShown, setSurpriseShown] = useState(false);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const [streakPrompt, setStreakPrompt] = useState(null);

  // Load questions
  useEffect(() => {
    async function tryLoad() {
      try {
        const res = await fetch(
          `/questions/grade${grade}/${subject}_${level}.json`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : [];
          if (arr.length) {
            setQuestions(shuffle(arr).slice(0, 10));
            return;
          }
        }
      } catch (e) {
        // ignore fetch errors and fall back
      }
      // fallback sample set
      const fallback = [];
      for (let i = 0; i < 10; i++)
        fallback.push({
          question_en: `Sample question ${i + 1}?`,
          question_ta: `மாதிரி கேள்வி ${i + 1}?`,
          options_en: ["Option A", "Option B", "Option C", "Option D"],
          options_ta: ["A", "B", "C", "D"],
          answer: "Option B",
        });
      setQuestions(fallback);
    }
    tryLoad();
  }, [grade, subject, level]);

  // Timer effect for each question
  useEffect(() => {
    if (!questions.length) return;
    const secs = level === "easy" ? 20 : level === "medium" ? 30 : 45;
    setTimeLeft(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleTimeout();
          return secs;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, index, level]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(timerRef.current);
      clearTimeout(surpriseTimeoutRef.current);
    };
  }, []);

  function handleTimeout() {
    setFeedback("bad");
    setStreak(0);
    playTone("bad");
    setAnswered(true);
    setSelectedOption(null);
    setIsCorrect(false);
    timeoutRef.current = setTimeout(() => {
      resetState();
      nextQuestion();
    }, 1000);
  }

  function handleAnswer(selected) {
    if (!questions.length || answered) return;
    setAnswered(true);
    setSelectedOption(selected);

    const q = questions[index];
    const possibleCorrect = new Set(
      [q.answer, q.answer_en, q.correct].filter(Boolean)
    );
    const correct = possibleCorrect.has(String(selected));
    const nextScore = correct ? score + 1 : score;

    // persist score quickly
    setScore(nextScore);
    sessionStorage.setItem("quiz_score", String(nextScore));

    if (correct) {
      setStreak((s) => s + 1);
      setFeedback("good");
      setIsCorrect(true);
      playTone("good");
    } else {
      setStreak(0);
      setFeedback("bad");
      setIsCorrect(false);
      playTone("bad");
    }

    timeoutRef.current = setTimeout(() => {
      resetState();
      nextQuestion(nextScore);
    }, 1000);
  }

  function resetState() {
    setFeedback(null);
    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
  }

  function nextQuestion(finalScore) {
    if (index + 1 >= questions.length) {
      const fs = typeof finalScore === "number" ? finalScore : score;
      sessionStorage.setItem("quiz_score", String(fs));
      navigate(`/result/${fs}`);
    } else {
      setIndex((i) => i + 1);
    }
  }

  // Surprise modal trigger for hitting score >= 8
  useEffect(() => {
    if (score >= 8 && !surpriseShown) {
      setShowSurpriseModal(true);
      setSurpriseShown(true);
      playTone("good");
      surpriseTimeoutRef.current = setTimeout(() => {
        setShowSurpriseModal(false);
      }, 2000);
    }
  }, [score, surpriseShown]);

  // Progressive streak prompts (duration reduced)
  useEffect(() => {
    const prompts = {
      3: "🔥 Amazing! 3 Correct in a Row!",
      5: "🌟 Brilliant! 5 Correct in a Row!",
      7: "🏆 Outstanding! 7 Correct in a Row!",
      10: "👑 Unstoppable! 10 Correct in a Row!",
    };
    if (streak > 0 && prompts[streak]) {
      setStreakPrompt(prompts[streak]);
      playTone("good");
      // Reduced duration to 900ms
      const t = setTimeout(() => setStreakPrompt(null), 1000);
      return () => clearTimeout(t);
    }
    // no cleanup needed otherwise
  }, [streak]);

  if (!questions.length)
    return <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>;

  const q = questions[index];
  const total = questions.length;
  const progressPct = Math.round((index / total) * 100);
  const correctSet = new Set([q.answer, q.answer_en, q.correct].filter(Boolean));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 36,
      }}
    >
      {/* Background (uses theme) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: theme || "linear-gradient(180deg,#071129 0%, #2b0f2f 100%)",
          zIndex: 0,
        }}
      />

      {/* Surprise Popup */}
      <AnimatePresence>
        {showSurpriseModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                background: "linear-gradient(135deg,#34d399,#059669)",
                borderRadius: 18,
                color: "#fff",
                fontSize: 22,
                fontWeight: 800,
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
              }}
            >
              🎉 Congratulations! <br /> You unlocked a Surprise Game! ✨
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Prompt */}
      <AnimatePresence>
        {streakPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.72 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 101,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                padding: "20px 28px",
                background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
                borderRadius: 16,
                color: "#fff",
                fontSize: 20,
                fontWeight: 900,
                textAlign: "center",
                boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
              }}
            >
              {streakPrompt}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 90,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background:
                  feedback === "good"
                    ? "linear-gradient(90deg,#bbf7d0,#34d399)"
                    : "linear-gradient(90deg,#fecaca,#f87171)",
                color: "#081225",
                fontSize: 22,
                fontWeight: 800,
                boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
              }}
            >
              {feedback === "good" ? "✅ Correct! / சரி!" : "❌ Incorrect! / தவறு!"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main quiz card */}
      <div
        style={{
          width: "min(1180px, 96%)",
          borderRadius: 18,
          padding: "28px 32px",
          background: "rgba(6,8,14,0.88)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 30px 80px rgba(2,6,23,0.65)",
          zIndex: 50,
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 20, minWidth: 110 }}>Q {index + 1}/{total}</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ height: 12, background: "#26272b", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: 12, width: progressPct + "%", background: "linear-gradient(90deg,#ffd89b,#ff8a00)", transition: "width 320ms ease" }} />
            </div>
          </div>
          <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
            Streak: {streak} • Score: {score}
          </div>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          {/* Left: Question */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 18 }}>
              <div>{q.question_en}</div>
              <div style={{ fontSize: 18, color: "#bdbdbd", marginTop: 10 }}>{q.question_ta}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(q.options_en || []).map((opt, i) => {
                const optionText = q.options_en[i];
                const isSelected = selectedOption === optionText;
                const optionIsCorrect = correctSet.has(String(optionText));
                let bg = "#1f1f26", color = "#fafafa", boxShadow = "0 10px 26px rgba(0,0,0,0.45)";
                if (answered) {
                  if (optionIsCorrect) { bg = "linear-gradient(90deg,#34d399,#059669)"; color = "#fff"; boxShadow = "0 12px 30px rgba(34,197,94,0.6)"; }
                  if (isSelected && isCorrect === false && !optionIsCorrect) { bg = "linear-gradient(90deg,#f87171,#dc2626)"; color = "#fff"; boxShadow = "0 12px 30px rgba(239,68,68,0.6)"; }
                  if (!isSelected && !optionIsCorrect) { bg = "#1f1f26"; color = "#9aa0a6"; boxShadow = "none"; }
                }
                return (
                  <motion.div
                    key={i}
                    whileHover={answered ? {} : { scale: 1.03 }}
                    whileTap={answered ? {} : { scale: 0.97 }}
                    onClick={() => !answered && handleAnswer(optionText)}
                    style={{
                      padding: "18px 22px",
                      borderRadius: 14,
                      fontSize: 20,
                      minHeight: 70,
                      textAlign: "left",
                      cursor: answered ? "not-allowed" : "pointer",
                      background: bg,
                      color,
                      boxShadow,
                      fontWeight: 700,
                      transition: "all 0.25s ease",
                    }}
                  >
                    {optionText} <span style={{ opacity: 0.7 }}> / </span>
                    <span style={{ fontSize: 16, color: "#bdbdbd" }}>{q.options_ta ? q.options_ta[i] : ""}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Timer & progress */}
          <div style={{ width: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", width: 150, height: 150 }}>
              <svg width="150" height="150" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
                <defs>
                  <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffd89b" />
                    <stop offset="100%" stopColor="#ff8a00" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="64" stroke="#232427" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="64" stroke="url(#g1)" strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={(1 - timeLeft / (level === "easy" ? 20 : level === "medium" ? 30 : 45)) * 2 * Math.PI * 64}
                  strokeLinecap="round" fill="none" style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 28, fontWeight: 900, color: "#fff" }}>
                {timeLeft}s
              </div>
            </div>

            <div style={{ fontWeight: 800, fontSize: 20 }}>Score: {score}</div>
            <div style={{ fontSize: 18 }}>Streak: {streak}</div>

            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "linear-gradient(90deg,#ffd89b,#ff8a00)", color: "#1f1f1f", fontWeight: 700, fontSize: 15, textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>
              🎉 Score 8 or more unlocks a Surprise Game! ✨
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}