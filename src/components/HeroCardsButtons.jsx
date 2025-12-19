import React from "react";
import { motion } from "framer-motion";

/**
 * HeroCardsButtons
 * Two hero cards (Start Assessment + Games) styled to match your screenshot.
 * Props:
 *  - onStart: () => void
 *  - onGames: () => void
 */
export default function HeroCardsButtons({ onStart = () => {}, onGames = () => {} }) {
  const CARD_W = 240;
  const CARD_H = 260;

  const cardStyle = {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
    boxSizing: "border-box",
  };

  const circleStyle = {
    width: 140,
    height: 140,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 18px 46px rgba(0,0,0,0.45), inset 0 -8px 20px rgba(255,255,255,0.03)",
  };

  const pill = {
    padding: "10px 20px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
    border: "none",
  };

  // small book icon (white stroke) — simple inline svg
  const BookSVG = ({ size = 46 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6.5C3 5.67 3.67 5 4.5 5H19.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 19.5C3 18.67 3.67 18 4.5 18H19.5C20.33 18 21 18.67 21 19.5V6.5C21 5.67 20.33 5 19.5 5H4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 7.5V17.5" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  // small gamepad svg (white stroke)
  const GamepadSVG = ({ size = 56 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 12h.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 9v6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 9v6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 12h.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.5 9.5c-.3-1.8-1.8-3-3.5-3.5-1.3-.4-2.7-.5-4-.5s-2.7.1-4 .5C6.3 6.5 4.8 7.7 4.5 9.5 4.3 10.6 4.5 11.2 5 12c.6 1 2 2 3 2h8c1 0 2.4-1 3-2 .5-.8.7-1.4.5-2.5z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div style={{ display: "flex", gap: 28, justifyContent: "center", alignItems: "flex-end", marginTop: 18 }}>
      {/* Start Assessment Card (circle icon) */}
      <motion.div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onStart(); }}
        onClick={onStart}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -10 }}
        whileTap={{ scale: 0.98 }}
        style={{
          ...cardStyle,
          background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
        aria-label="Start Assessment"
      >
        {/* Circular icon bubble */}
        <motion.div
          style={{
            ...circleStyle,
            background: "linear-gradient(180deg,#5b8cff,#3aa0ff)",
            border: "2px solid rgba(255,255,255,0.06)",
          }}
          whileHover={{ scale: 1.06, boxShadow: "0 30px 60px rgba(59,130,246,0.18)" }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220 }}>
            <BookSVG size={46} />
          </motion.div>
        </motion.div>

        {/* label + pill */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Start Assessment</div>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            whileHover={{ scale: 1.02 }}
            style={{
              ...pill,
              background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(124,58,237,0.18)",
              width: "100%",
              maxWidth: 180,
              margin: "6px auto 2px",
            }}
            aria-label="Start Assessment button"
          >
            Start Assessment
          </motion.button>
        </div>
      </motion.div>

      {/* Games Card (diamond icon) */}
      <motion.div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onGames(); }}
        onClick={onGames}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -10 }}
        whileTap={{ scale: 0.98 }}
        style={{
          ...cardStyle,
          background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
        aria-label="Games"
      >
        {/* diamond background: render a square rotated 45deg and center the gamepad inside */}
        <motion.div
          style={{
            width: 140,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(45deg)",
            borderRadius: 22,
            boxShadow: "0 18px 46px rgba(0,0,0,0.45), inset 0 -8px 20px rgba(255,255,255,0.03)",
          }}
          whileHover={{ scale: 1.08, rotate: 0, boxShadow: "0 30px 60px rgba(255,77,109,0.16)" }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <motion.div style={{ width: 100, height: 100, borderRadius: 12, transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#ff7db0,#ff4d6d)", boxShadow: "0 8px 28px rgba(0,0,0,0.45)" }} initial={{ scale: 0.98 }} animate={{ scale: 1 }} >
            {/* gamepad svg is not rotated (because parent counter-rotated) */}
            <GamepadSVG size={52} />
          </motion.div>
        </motion.div>

        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Games</div>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onGames(); }}
            whileHover={{ scale: 1.02 }}
            style={{
              ...pill,
              background: "linear-gradient(90deg,#f97316,#f43f5e)",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(255,77,109,0.16)",
              width: "100%",
              maxWidth: 140,
              margin: "6px auto 2px",
            }}
            aria-label="Games button"
          >
            Play
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
