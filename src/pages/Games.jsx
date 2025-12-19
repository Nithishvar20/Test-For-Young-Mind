import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Puzzle, Calculator, Eye, HelpCircle } from "lucide-react";
import { useLang } from "../state/LangContext";

const BASE_GAMES = [
  {
    id: "tictactoe",
    path: "/games/tictactoe",
    color: "linear-gradient(90deg,#ff8aa0,#ff6b9a)",
    icon: <Puzzle size={34} />,
  },
  {
    id: "riddles",
    path: "/games/riddles",
    color: "linear-gradient(90deg,#34d399,#059669)",
    icon: <HelpCircle size={34} />,
  },
  {
    id: "visualmemory",
    path: "/games/visualmemory",
    color: "linear-gradient(90deg,#a78bfa,#7c3aed)",
    icon: <Eye size={34} />,
  },
  {
    id: "puzzlequest",
    path: "/games/puzzlequest",
    color: "linear-gradient(90deg,#f97316,#fb923c)",
    icon: <Puzzle size={34} />,
  },
  {
    id: "sudoku",
    path: "/games/chess",
    color: "linear-gradient(90deg,#34d399,#059669)",
    icon: <span style={{ fontSize: 24 }}>🧩</span>,
  },
  {
    id: "arithmetica",
    path: "/games/arithmetica",
    color: "linear-gradient(90deg,#7dd3fc,#4cc9f0)",
    icon: <Calculator size={34} />,
  },
];

export default function Games() {
  const nav = useNavigate();
  const { t } = useLang();

  const idToKey = {
    tictactoe: "tic_tac_toe",
    riddles: "riddles_game",
    visualmemory: "visual_memory",
    puzzlequest: "puzzlequest",
    sudoku: "sudoku",
    arithmetica: "arithmetica",
  };

  // ✅ Load translations from LangContext
  const GAMES = BASE_GAMES.map((g) => {
    const key = idToKey[g.id] || g.id;
    const translated = (t?.games && t.games[key]) || {};
    return {
      ...g,
      name: translated.title || g.id,
      grade: translated.subtitle || "",
      desc: translated.description || "",
      // ✅ Force all buttons to say "Play" (English) or "விளையாடு" (Tamil)
      btn: t?.games?.tic_tac_toe?.btn || "Play",
    };
  });

  const title = t?.gamesHubTitle || "Game Hub";
  const subtitle =
    t?.gamesHubSubtitle ||
    "Sharpen your mind with short playful challenges. Choose a game to begin!";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "linear-gradient(180deg,#071129 0%, #0b1220 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "40px 24px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", color: "#fff" }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 40 }}
          >
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: 20 }}>
              {title}
            </h1>
            <p
              style={{
                marginTop: 12,
                fontSize: 16,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {subtitle}
            </p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
              justifyItems: "center",
            }}
          >
            {GAMES.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                role="button"
                onClick={() => nav(g.path)}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))",
                  padding: 24,
                  borderRadius: 16,
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minHeight: 360,
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: 320,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    background: g.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    marginBottom: 18,
                  }}
                >
                  {g.icon}
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>
                  {g.name}
                </h3>
                <p
                  style={{
                    fontSize: 17,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 14,
                  }}
                >
                  {g.grade}
                </p>

                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 22,
                    lineHeight: 1.8,
                    textAlign: "justify",
                  }}
                >
                  {g.desc}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nav(g.path);
                  }}
                  style={{
                    marginTop: "auto",
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "none",
                    fontWeight: 700,
                    fontSize: 15,
                    background: g.color,
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                  }}
                >
                  {g.btn}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}