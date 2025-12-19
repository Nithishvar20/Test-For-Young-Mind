// src/pages/ChooseMode.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../state/LangContext";
import { useTheme } from "../state/ThemeContext";
import { BookOpen, Gamepad2 } from "lucide-react";

export default function ChooseMode() {
  const nav = useNavigate();
  const { t } = useLang(); // ✅ proper context usage
  const { theme } = useTheme?.() || { theme: "linear-gradient(180deg,#0b1020,#0f1724)" };

  const HEADER_HEIGHT = 72;
  const TITLE_TOP = HEADER_HEIGHT + 60;
  const CARDS_TOP = TITLE_TOP + 100;

  // ✅ Pull translations from t.chooseMode
  const modes = [
    {
      id: "QUIZ",
      title: t.chooseMode.quizModeTitle,
      gradesLine: t.chooseMode.quizModeSubtitle,
      description: t.chooseMode.quizModeDesc,
      gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", // cyan → blue
      icon: <BookOpen size={36} color="white" />,
      button: t.chooseMode.start,
      route: "/assessment",
    },
    {
      id: "LAB",
      title: t.chooseMode.labGamesTitle,
      gradesLine: t.chooseMode.labGamesSubtitle,
      description: t.chooseMode.labGamesDesc,
      gradient: "linear-gradient(135deg,#f5576c,#f093fb)", // pink → purple
      icon: <Gamepad2 size={36} color="white" />,
      button: t.chooseMode.start,
      route: "/games/lab",
    },
  ];

  function handleCardKey(e, route) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      nav(route);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        color: "#fff",
      }}
    >
      {/* Background */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -300,
          background: theme,
          backgroundAttachment: "fixed",
        }}
      />

      {/* Overlay */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -200,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 55%)",
        }}
      />

      {/* Title */}
      <h1
        style={{
          position: "fixed",
          top: TITLE_TOP,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 40,
          fontWeight: 800,
          textShadow: "0 6px 20px rgba(0,0,0,0.6)",
          margin: 0,
          zIndex: 100,
        }}
      >
        {t.chooseMode.title}
      </h1>

      {/* Cards */}
      <div
        style={{
          position: "fixed",
          top: CARDS_TOP,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 32,
          width: "min(1100px, 94%)",
          zIndex: 90,
        }}
      >
        {modes.map((mode) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleCardKey(e, mode.route)}
            onClick={() => nav(mode.route)}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.995 }}
            style={{
              flex: "1 1 420px",
              maxWidth: 520,
              minHeight: 300,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 16,
              padding: "24px 28px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {/* Icon + Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: mode.gradient,
                  boxShadow: `0 8px 22px rgba(0,0,0,0.28)`,
                }}
              >
                {mode.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{mode.title}</div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 700,
                  }}
                >
                  {mode.gradesLine}
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                flexGrow: 1,
                fontSize: 15,
                lineHeight: 1.8,
                textAlign: "justify",
                color: "rgba(255,255,255,0.9)",
                margin: "18px 0 20px",
              }}
            >
              {mode.description}
            </div>

            {/* Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nav(mode.route);
              }}
              style={{
                width: "100%",
                background: mode.gradient,
                border: "none",
                padding: "12px 18px",
                borderRadius: 10,
                fontWeight: 800,
                color: "#fff",
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                transition: "transform 0.18s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {mode.button}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}