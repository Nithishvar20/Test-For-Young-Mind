// src/pages/Result.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../state/LangContext'
import { addScoreEntry } from "../state/leaderboard"; 
import { useAuth } from "../state/AuthContext";  
import { useTheme } from "../state/ThemeContext"; // ✅ added theme hook

/* --- Styles --- */
// (keep your styles exactly as before, page becomes a function to accept theme)
const styles = {
  page: (theme) => ({
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme || 'linear-gradient(180deg,#071129 0%, #0b1220 100%)', // theme applied if provided
    padding: 12,
    overflow: 'hidden'
  }),
  leftControls: { display: 'flex', flexDirection: 'column', gap: 12, marginRight: 30, alignSelf: 'center', minWidth: 140, },
  controlBtn: { background: 'linear-gradient(90deg,#6b21a8,#4c1d95)', color: '#fff', padding: '12px 18px', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 22px rgba(75,21,122,0.18)', width: 150, textAlign: 'center', transition: 'transform 0.12s ease', },
  hintBtn: { background: 'linear-gradient(90deg,#f59e0b,#f97316)', color: '#071021', padding: '12px 18px', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 18px rgba(246,139,34,0.22)', width: 150, textAlign: 'center', transition: 'transform 0.12s ease', },
  gridPanel: { background: 'linear-gradient(180deg,#0f1724,#0b1117)', borderRadius: 14, padding: '10px 12px', boxShadow: '0 30px 100px rgba(2,6,23,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'min(700px, 86%)', maxWidth: 760, zIndex: 2, position: 'relative' },
  resultCardWrap: { width: 'min(1100px, 94%)', maxWidth: 1120, borderRadius: 18, padding: 26, display: 'flex', gap: 32, alignItems: 'stretch', position: 'relative', zIndex: 10, background: 'linear-gradient(180deg, rgba(6,13,20,0.92), rgba(10,15,20,0.9))', boxShadow: '0 60px 160px rgba(2,6,23,0.9), 0 10px 30px rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.03)', backdropFilter: 'blur(12px) saturate(130%)', WebkitBackdropFilter: 'blur(12px) saturate(130%)', },
  leftColumn: { flex: '0 0 36%', minWidth: 360, display: 'flex', flexDirection: 'column', gap: 18 },
  rightColumn: { flex: '1 1 auto', paddingLeft: 10, display: 'flex', flexDirection: 'column' },
  circleScoreOuter: { width: 180, height: 180, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: 'inset 0 12px 28px rgba(0,0,0,0.55), 0 26px 80px rgba(0,0,0,0.5)', border: '7px solid rgba(0,0,0,0.45)' },
  circleInnerNumber: { fontSize: 40, fontWeight: 900, color: '#fff' },
  metaItem: { color: '#cbd5e1', fontSize: 16 },
  heading: { margin: 0, fontSize: 30, fontWeight: 900, color: '#fff' },
  categoryRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12 },
  progressBarTrack: { height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: (pct) => ({ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#34d399,#10b981)', borderRadius: 10, }),
  answersRow: { display: 'flex', gap: 14, marginTop: 20, alignItems: 'center' },
  answerBadge: { padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', color: '#e6eef5', fontWeight: 800, minWidth: 120, textAlign: 'center', fontSize: 15, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' },
  tinyText: { color: '#9fb3c8', fontSize: 14, marginTop: 8 },
  quotePill: { padding: '12px 16px', borderRadius: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 20px rgba(2,6,23,0.6)', fontSize: 15 },
  streakPopup: { position: 'fixed', left: '50%', top: '18%', transform: 'translateX(-50%) scale(1)', padding: '14px 18px', borderRadius: 14, zIndex: 1200, fontWeight: 900, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }
}

/* word bank (50 words) */
const WORD_BANK = [
  'LEARN','STUDY','BOOK','TEACH','MATH','BRAIN','KNOW','CLASS','PUPIL','TEACHER',
  'SCHOOL','EXAM','GRADE','QUIZ','STUDYING','MEMORY','LOGIC','REASON','READ','WRITE',
  'NUMBER','COUNT','PLUS','MINUS','ADD','SUBTRACT','ANSWER','PROBLEM','SOLVE','KNOWLEDGE',
  'CURRICULUM','LEARNING','PRACTICE','SKILL','TRAIN','PLAY','GAME','PUZZLE','THINK','IDEA',
  'CONCEPT','TOPIC','SUBJECT','CHAPTER','RECALL','REMEMBER','UNDERSTAND','DISCOVER','INVENT','CREATE'
]

/* place words horizontally or vertically into a grid */
function generateWordSearch(words, size = 12) {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => null))
  const placed = []
  const rand = (n) => Math.floor(Math.random() * n)

  for (const w of words) {
    const word = w.toUpperCase()
    let placedFlag = false
    for (let attempt = 0; attempt < 400 && !placedFlag; attempt++) {
      const dir = Math.random() < 0.5 ? 'H' : 'V'
      const len = word.length
      if (dir === 'H') {
        const row = rand(size)
        const col = rand(Math.max(1, size - len + 1))
        let ok = true
        for (let i = 0; i < len; i++) {
          const c = grid[row][col + i]
          if (c && c !== word[i]) { ok = false; break }
        }
        if (!ok) continue
        for (let i = 0; i < len; i++) grid[row][col + i] = word[i]
        placed.push({ word, dir, row, col, len })
        placedFlag = true
      } else {
        const row = rand(Math.max(1, size - len + 1))
        const col = rand(size)
        let ok = true
        for (let i = 0; i < len; i++) {
          const c = grid[row + i][col]
          if (c && c !== word[i]) { ok = false; break }
        }
        if (!ok) continue
        for (let i = 0; i < len; i++) grid[row + i][col] = word[i]
        placed.push({ word, dir, row, col, len })
        placedFlag = true
      }
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = letters.charAt(Math.floor(Math.random() * letters.length))
  return { grid, placed }
}

/* --- Helpers for result display --- */
const getBadgeStyleAndLabel = (score) => {
  if (score <= 5) return { gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)', label: 'Keep Practicing' }
  if (score <= 7) return { gradient: 'linear-gradient(135deg,#facc15,#eab308)', label: 'Good Job' }
  return { gradient: 'linear-gradient(135deg,#22c55e,#15803d)', label: 'Excellent' }
}

// ⭐ Updated motivational quote (expanded)
const getQuote = (score) => {
  if (score <= 3) return { text: "Every expert was once a beginner. Keep going!", emoji: '🌱' }
  if (score <= 5) return { text: "Don't be discouraged — practice builds progress.", emoji: '💪' }
  if (score <= 7) return { text: "Nice work — you're improving with every try!", emoji: '👍' }
  if (score <= 9) return { text: "Great job! You're mastering this step by step.", emoji: '🚀' }
  return { text: "Outstanding! You're an inspiration to others!", emoji: '🏆' }
}

/* --- Component --- */
export default function Result() {
  const { t = {} } = useLang() || {}
  const nav = useNavigate()
  const { score: scoreParam } = useParams()
  const { theme } = useTheme() || {} // ✅ read the selected theme
  const initialScore = parseInt(scoreParam || sessionStorage.getItem('quiz_score') || '0', 10) || 0

  const [score, setScore] = useState(initialScore)
  const [puzzle, setPuzzle] = useState(null)
  const [found, setFound] = useState([])
  const [selectedCells, setSelectedCells] = useState([])
  const [gameTime, setGameTime] = useState(60)
  const gameTimerRef = useRef(null)
  const [gameActive, setGameActive] = useState(false)
  const [hintIndex, setHintIndex] = useState(null)
  const [wordsToFind, setWordsToFind] = useState([])

  const [timeUpPopup, setTimeUpPopup] = useState(false)
  const [celebratePopup, setCelebratePopup] = useState(false)
  const [showStreakPopup, setShowStreakPopup] = useState(false)
  const [showResultPopper, setShowResultPopper] = useState(false)

  const { gradient: badgeGradient } = getBadgeStyleAndLabel(score)
  const q = getQuote(score)
  const percentage = Math.round((score / 10) * 100)

  const { user } = useAuth?.() || {}

  // prevent double-saving (e.g. React StrictMode double mount)
  const saveOnceRef = useRef(false)

  // --- SAVE SCORE ONCE when the result page mounts ---
  useEffect(() => {
    if (saveOnceRef.current) return
    saveOnceRef.current = true

    // Save to leaderboard (only once when the result page loads)
    try {
      // generate a single timestamp to avoid near-duplicate entries with different dates
      const now = new Date().toISOString()

      try {
        addScoreEntry({
          name: user?.name || "Anonymous",
          school: user?.school || "",
          place: user?.place || "",
          score: Number(initialScore),
          date: now
        })
      } catch (innerErr) {
        console.warn("Failed to addScoreEntry:", innerErr)
      }

      // small console feedback for debugging
      console.log("Saved quiz result to leaderboard:", { name: user?.name || "Anonymous", score: Number(initialScore) })
    } catch (e) {
      console.warn("Failed to save quiz result:", e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // empty deps -> run once on mount

  // init: show mini-game only for high scores
  useEffect(() => {
    let final = initialScore
    try { const stored = sessionStorage.getItem('quiz_score'); if (stored !== null) final = parseInt(stored, 10) } catch (e) {}
    setScore(final)

    if (final >= 8) {
      const pool = [...WORD_BANK]
      const chosen = []
      while (chosen.length < 5 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length)
        chosen.push(pool.splice(idx, 1)[0])
      }
      const chosenUpper = chosen.map(w => w.toUpperCase())
      setWordsToFind(chosenUpper)
      const generated = generateWordSearch(chosenUpper, 12)
      setPuzzle(generated)
      setFound([])
      setSelectedCells([])
      setGameTime(60)
      setGameActive(true)
    } else {
      setPuzzle(null)
    }

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // timer for mini-game
  useEffect(() => {
    if (!puzzle) {
      setGameActive(false)
      return
    }
    setGameActive(true)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    gameTimerRef.current = setInterval(() => {
      setGameTime(t => {
        if (t <= 1) {
          if (gameTimerRef.current) { clearInterval(gameTimerRef.current); gameTimerRef.current = null }
          setGameActive(false)
          setTimeUpPopup(true)
          setTimeout(() => {
            setTimeUpPopup(false)
            // end the mini-game and show the result card (instead of navigating home)
            setPuzzle(null)
            if (gameTimerRef.current) { clearInterval(gameTimerRef.current); gameTimerRef.current = null }
          }, 2000)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (gameTimerRef.current) clearInterval(gameTimerRef.current) }
  }, [puzzle, nav])

  // Show streak popup if user has 5 or more streaks (from sessionStorage 'streak')
  useEffect(() => {
    try {
      const s = parseInt(sessionStorage.getItem('streak') || '0', 10) || 0
      if (s >= 5) {
        setShowStreakPopup(true)
        const t = setTimeout(() => setShowStreakPopup(false), 2000)
        return () => clearTimeout(t)
      }
    } catch (e) { /* ignore */ }
  }, [])

  // Show a popper animation when result view is ready (puzzle is null)
  useEffect(() => {
    if (puzzle === null) {
      // small delay so layout settles
      const id = setTimeout(() => {
        setShowResultPopper(true)
        const t = setTimeout(() => setShowResultPopper(false), 2200)
        // cleanup
        return () => clearTimeout(t)
      }, 120)
      return () => clearTimeout(id)
    }
    return undefined
  }, [puzzle])

  /* grid helpers */
  const size = puzzle ? puzzle.grid.length : 12
  const idxOf = (r, c) => r * size + c
  const coordOf = (i) => [Math.floor(i / size), i % size]

  function handleCellClick(r, c) {
    if (!gameActive) return
    const idx = idxOf(r, c)
    for (const p of (puzzle?.placed || [])) {
      if (!found.includes(p.word)) continue
      if (p.dir === 'H' && r === p.row && c >= p.col && c < p.col + p.len) return
      if (p.dir === 'V' && c === p.col && r >= p.row && r < p.row + p.len) return
    }
    setSelectedCells(prev => {
      if (prev.includes(idx)) return prev.filter(x => x !== idx)
      return [...prev, idx]
    })
    setHintIndex(null)
  }

  function resetSelection() {
    setSelectedCells([])
    setHintIndex(null)
  }

  function confirmSelection() {
    if (!puzzle || selectedCells.length === 0) return
    const letters = selectedCells.map(i => {
      const [r, c] = coordOf(i)
      return puzzle.grid[r][c]
    }).join('')
    const rev = letters.split('').reverse().join('')
    let matched = null
    for (const p of (puzzle?.placed || [])) {
      if (found.includes(p.word)) continue
      if (p.word === letters || p.word === rev) { matched = p.word; break }
    }
    if (matched) {
      setFound(f => {
        const next = [...f, matched]
        if (next.length >= wordsToFind.length) {
          setCelebratePopup(true)
          setTimeout(() => {
            setCelebratePopup(false)
            // end the mini-game and show the result card (instead of navigating home)
            setPuzzle(null)
            if (gameTimerRef.current) { clearInterval(gameTimerRef.current); gameTimerRef.current = null }
          }, 2000)
        }
        return next
      })
      setSelectedCells([])
    } else {
      setTimeout(() => setSelectedCells([]), 350)
    }
  }

  function showHint() {
    if (!puzzle) return
    const remainingPlaced = puzzle.placed.filter(p => !found.includes(p.word))
    if (!remainingPlaced.length) return
    const pick = remainingPlaced[Math.floor(Math.random() * remainingPlaced.length)]
    const midOffset = Math.floor((pick.len - 1) / 2)
    let r, c
    if (pick.dir === 'H') { r = pick.row; c = pick.col + midOffset } else { r = pick.row + midOffset; c = pick.col }
    const midIdx = idxOf(r, c)
    setHintIndex(midIdx)
    setTimeout(() => setHintIndex(null), 1600)
  }

  function cellIsFound(r, c) {
    for (const p of (puzzle?.placed || [])) {
      if (!found.includes(p.word)) continue
      if (p.dir === 'H' && r === p.row && c >= p.col && c < p.col + p.len) return true
      if (p.dir === 'V' && c === p.col && r >= p.row && r < p.row + p.len) return true
    }
    return false
  }

  /* --- RESULT CARD (when no puzzle) --- */
  if (!puzzle) {
    const correct = parseInt(sessionStorage.getItem('quiz_correct') || Math.max(0, Math.min(10, score)), 10)
    const incorrect = Math.max(0, 10 - correct)
    const categories = [
      { name: t?.resultPage?.understanding || 'Understanding', pct: Math.min(100, Math.round(score * 9)) },
      { name: t?.resultPage?.retention || 'Retention', pct: Math.min(100, Math.round(score * 7.5)) }
    ]

    // pick emoji + color for quote pill
    const quoteEmoji = q?.emoji || '✨'
    const quoteText = q?.text || ''
    const pillStyle = {
      ...styles.quotePill,
      background: score >= 8 ? 'linear-gradient(90deg,#eef2ff,#e0f2fe)' : score >= 5 ? 'linear-gradient(90deg,#fff7ed,#fff1c2)' : 'linear-gradient(90deg,#fef3f2,#fee2e2)',
      color: score >= 8 ? '#0b1220' : '#221c15'
    }

    // --- CONFETTI-STYLE PAPERS CONFIG (colored rectangles)
    const PAPER_COLORS = ['#ff7a7a', '#ffd166', '#7dd3fc', '#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fbbf24'];
    // make a set of items with left%, rotate, delay, size, skew
    const paperItems = Array.from({ length: 26 }).map((_, i) => {
      const left = Math.round(Math.random() * 92) + 4; // 4%..96%
      const delay = Number((Math.random() * 0.6).toFixed(2)); // 0..0.6s
      const w = 8 + Math.round(Math.random() * 14); // px
      const h = 16 + Math.round(Math.random() * 26); // px (rectangular)
      const color = PAPER_COLORS[i % PAPER_COLORS.length];
      const rot = Math.round(-40 + Math.random() * 80); // -40 .. 40 deg
      const skew = Math.round(-10 + Math.random() * 20);
      const spin = Math.random() < 0.5 ? (Math.random() * 360) : (Math.random() * -360);
      return { left, delay, w, h, color, rot, skew, spin, key: `paper-${i}` };
    });

    return (
      <div style={styles.page(theme)}>
        <div style={styles.resultCardWrap}>
          <div style={styles.leftColumn}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ ...styles.circleScoreOuter, background: badgeGradient }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#fff' }}>{percentage}%</div>
                <div style={{ fontSize: 16, marginTop: 8, color: '#fff' }}>{score}/10</div>
              </div>

              <div>
                <h3 style={styles.heading}>{t?.resultPage?.title || 'Result'}</h3>
                <div style={{ marginTop: 12 }}>
                  <div style={styles.metaItem}><strong style={{ color: '#fff', fontSize: 18 }}>{score}/10</strong> {t?.scoreLabel || 'points'}</div>
                  {/* Duration removed as requested */}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={styles.tinyText}>{/* small helper text if needed */}</div>
            </div>
          </div>

          <div style={styles.rightColumn}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#cbd5e1', fontWeight: 800, fontSize: 16 }}>{t?.resultPage?.categories || 'Categories'}</div>
              <div style={{ color: '#9fb3c8', fontSize: 14 }}>{t?.resultPage?.pointsOverview || 'Points overview'}</div>
            </div>

            <div style={{ marginTop: 14 }}>
              {categories.map(cat => (
                <div key={cat.name} style={styles.categoryRow}>
                  <div style={{ color: '#e6eef5', fontWeight: 700, fontSize: 15 }}>{cat.name}</div>
                  <div style={{ flex: '0 0 50%', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.progressBarTrack}>
                        <div style={styles.progressBarFill(cat.pct)} />
                      </div>
                    </div>
                    <div style={{ width: 40, textAlign: 'right', color: '#cbd5e1', fontSize: 14 }}>{cat.pct}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.answersRow}>
              <div style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 700 }}>{t?.resultPage?.answered || 'Answered:'}</div>
              <div style={styles.answerBadge}>{correct} {t?.resultPage?.correct || 'Correct'}</div>
              <div style={styles.answerBadge}>{incorrect} {t?.resultPage?.incorrect || 'Incorrect'}</div>
            </div>

            {/* ⭐ Motivational quote pill placed above Back to Home */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <div style={pillStyle}>
                <span style={{ fontSize: 20 }}>{quoteEmoji}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 14, color: pillStyle.color }}>{quoteText}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => nav('/leaderboard')} style={{ ...styles.controlBtn, width: 140, background: 'linear-gradient(90deg,#0ea5a4,#0284c7)' }}>{t?.resultPage?.leaderboard || 'Leaderboard'}</button>
                <button onClick={() => nav('/')} style={{ ...styles.controlBtn, width: 140 }}>{t?.resultPage?.home || 'Home'}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Result popper (appears briefly when result view opens) */}
        {showResultPopper && (
          <>
            {/* Small result popper card */}
            <div style={{ position: 'fixed', left: '50%', bottom: '14%', transform: 'translateX(-50%) translateY(0)', zIndex: 1300, transition: 'transform 240ms cubic-bezier(.2,.9,.2,1), opacity 240ms ease', opacity: showResultPopper ? 1 : 0 }}>
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(90deg,#eef2ff,#e9f8f0)', color: '#071021', boxShadow: '0 12px 40px rgba(2,6,23,0.6)', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800 }}>
                <div style={{ fontSize: 20 }}>🎯</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 15 }}>{t?.resultPage?.title || 'Result Ready'}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{score}/10 — {t?.resultPage?.greatEffort || 'Great effort!'}</div>
                </div>
              </div>
            </div>

            {/* COLOURED PAPER BURST (runs whenever showResultPopper is true) */}
            {/* Only show the bursting papers for scores greater than 6 */}
            {score > 6 && (
              <div
                aria-hidden
                style={{
                  position: "fixed",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 1250,
                  overflow: "hidden",
                }}
              >
                <style>{`
                  @keyframes paperFall {
                    0% { transform: translateY(-6vh) rotate(var(--rot)) scale(0.6) skewX(var(--skew)); opacity: 0; }
                    18% { opacity: 1; }
                    55% { transform: translateY(28vh) rotate(calc(var(--rot) + 45deg)) scale(1) skewX(var(--skew)); }
                    85% { transform: translateY(72vh) rotate(calc(var(--rot) + 120deg)) scale(0.98) skewX(var(--skew)); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(calc(var(--rot) + 160deg)) scale(1.02) skewX(var(--skew)); opacity: 0; }
                  }
                  @keyframes swayX {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(8px); }
                    100% { transform: translateX(-6px); }
                  }
                `}</style>

                {/* small radial burst center (visual) */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '16vh',
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)',
                  transform: 'translateX(-50%)',
                  zIndex: 1260
                }} />

                {paperItems.map((p) => {
                  const style = {
                    position: "absolute",
                    left: `${p.left}%`,
                    top: -40,
                    width: p.w,
                    height: p.h,
                    background: p.color,
                    transform: `translateX(-50%) rotate(${p.rot}deg) skewX(${p.skew}deg)`,
                    borderRadius: 2,
                    opacity: 0,
                    boxShadow: '0 6px 18px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
                    animation: `paperFall 1.9s cubic-bezier(.18,.9,.32,1) ${p.delay}s both, swayX 1.8s ease-in-out ${p.delay}s infinite`,
                    transformOrigin: 'center',
                    zIndex: 1260,
                    WebkitAnimation: `paperFall 1.9s cubic-bezier(.18,.9,.32,1) ${p.delay}s both, swayX 1.8s ease-in-out ${p.delay}s infinite`,
                    // CSS variables used inside keyframes
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '--rot': `${p.rot}deg`,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '--skew': `${p.skew}deg`,
                  };

                  return <div key={p.key} style={style} />
                })}
              </div>
            )}
          </>
        )}
        {/* Streak popup (2s) */}
        {showStreakPopup && (
          <div style={{ ...styles.streakPopup, background: 'linear-gradient(90deg,#fff7ed,#fff1c2)', color: '#221c15', transform: 'translateX(-50%) scale(1.06)', transition: 'transform 220ms ease, opacity 220ms ease' }}>
            <div style={{ fontSize: 26 }}>🔥🔥🔥</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18 }}>5-Streak!</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Amazing consistency — keep it up!</div>
            </div>
          </div>
        )}

        {/* Time's up / Celebrate popups still shown while puzzle is active */}
        {timeUpPopup && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ padding: 18, borderRadius: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 20, fontWeight: 800, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
              {t?.timeUpText || "Time's up!"}
            </div>
          </div>
        )}

        {celebratePopup && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ padding: 20, borderRadius: 14, background: 'linear-gradient(135deg,#34d399,#059669)', color: '#071021', fontSize: 22, fontWeight: 900, boxShadow: '0 20px 80px rgba(0,0,0,0.45)' }}>
              🎉 {t?.resultPage?.outstanding || "Congratulations! You found all words!"}
            </div>
          </div>
        )}

      </div>
    )
  }

  /* --- MINI-GAME (puzzle exists) --- */
  return (
    <div style={styles.page(theme)}>
      {/* Left controls */}
      <div style={styles.leftControls}>
        <button style={styles.controlBtn} onClick={resetSelection}>Reset</button>
        <button style={styles.controlBtn} onClick={confirmSelection}>Confirm</button>
        <button style={styles.hintBtn} onClick={showHint}>Hint</button>
      </div>

      {/* Center puzzle */}
      <div style={styles.gridPanel}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⏳</span><span style={{ color: '#ff9a5b' }}>{gameTime}s</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 34px)`, gap: 6 }}>
          {puzzle.grid.flat().map((ch, i) => {
            const [r, c] = coordOf(i)
            const isSelected = selectedCells.includes(i)
            const isFound = cellIsFound(r, c)
            const isHint = hintIndex === i
            return (
              <div key={i} onClick={() => handleCellClick(r, c)} style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, fontWeight: 800, fontSize: 13,
                background: isFound
                  ? 'linear-gradient(135deg,#89f7fe,#66a6ff)'
                  : isSelected
                    ? 'linear-gradient(135deg,#ffd89b,#ffb86b)'
                    : isHint
                      ? 'linear-gradient(135deg,#c7b8ff,#8f66ff)'
                      : 'rgba(255,255,255,0.03)',
                color: isFound || isSelected || isHint ? '#071021' : '#eef2f7',
                cursor: gameActive ? 'pointer' : 'default',
                boxShadow: isSelected || isFound ? '0 6px 16px rgba(0,0,0,0.35)' : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                userSelect: 'none'
              }}>{ch}</div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {wordsToFind.map(w => (
            <div key={w} style={{
              padding: '6px 10px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              background: found.includes(w) ? 'linear-gradient(90deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
              color: found.includes(w) ? '#fff' : '#cbd5e1'
            }}>{w}</div>
          ))}
        </div>
      </div>

      {/* Popups */}
      {timeUpPopup && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ padding: 18, borderRadius: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 20, fontWeight: 800, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
            {t?.timeUpText || "Time's up!"}
          </div>
        </div>
      )}

      {celebratePopup && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ padding: 20, borderRadius: 14, background: 'linear-gradient(135deg,#34d399,#059669)', color: '#071021', fontSize: 22, fontWeight: 900, boxShadow: '0 20px 80px rgba(0,0,0,0.45)' }}>
            🎉 {t?.resultPage?.outstanding || "Congratulations! You found all words!"}
          </div> 
        </div>
      )}
    </div>
  )
}