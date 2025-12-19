import React from "react";
import { motion } from "framer-motion";

export default function GameCards({ onNavigate }) {
  const games = [
    { id: "puzzle", label: "8 Puzzle", icon: "🧩", to: "/games/8puzzle" },
    { id: "ball", label: "Ball Sort", icon: "⚪", to: "/games/ball-sort" },
    { id: "memory", label: "Visual Memory", icon: "👁️", to: "/games/visual-memory" },
  ];

  return (
    <>
      <style>{`
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 800px;
          margin: 32px auto;
        }
        .game-card {
          height: 220px;
          border-radius: 20px;
          background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.08));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 10px 28px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 18px;
          color: #fff;
          cursor: pointer;
          transition: transform 240ms ease, box-shadow 240ms ease;
          position: relative;
          overflow: hidden;
        }
        .game-card:hover {
          transform: translateY(-10px) scale(1.04);
          box-shadow: 0 16px 44px rgba(124,58,237,0.55), 0 0 14px rgba(168,85,247,0.35);
        }
        .icon-wrap {
          width: 90px; height: 90px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #7c3aed, #4c1d95);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.45);
          margin-bottom: 12px;
          animation: float 3.2s ease-in-out infinite;
        }
        .label {
          font-weight: 700;
          font-size: 20px;
          margin-top: 8px;
        }

        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <div className="cards-grid">
        {games.map((g, i) => (
          <motion.div
            key={g.id}
            className="game-card"
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate(g.to)}
          >
            <div className="icon-wrap">{g.icon}</div>
            <div className="label">{g.label}</div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
