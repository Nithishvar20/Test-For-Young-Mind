// src/pages/Assessment.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../state/LangContext";
import { useTheme } from "../state/ThemeContext"; // ✅ added
import { Rocket, Award, Target } from "lucide-react";

export default function Assessment() {
  const nav = useNavigate();
  const { t } = useLang();
  const { theme } = useTheme(); // ✅ use theme

  const HEADER_HEIGHT = 72;
  const TITLE_TOP = HEADER_HEIGHT + 60;
  const CARDS_TOP = TITLE_TOP + 100;

  const levels = [
    {
      id: "BEGINNER",
      title: t.beginner,
      gradesLine: t.levelIntro.beginnerTitle,
      description: t.levelIntro.beginnerSubtitle,
      gradient: "linear-gradient(135deg,#4facfe,#00f2fe)",
      icon: <Rocket size={40} color="white" />,
      button: t.start,
    },
    {
      id: "INTERMEDIATE",
      title: t.intermediate,
      gradesLine: t.levelIntro.intermediateTitle,
      description: t.levelIntro.intermediateSubtitle,
      gradient: "linear-gradient(135deg,#34d399,#059669)",
      icon: <Award size={40} color="white" />,
      button: t.start,
    },
    {
      id: "ADVANCED",
      title: t.advanced,
      gradesLine: t.levelIntro.advancedTitle,
      description: t.levelIntro.advancedSubtitle,
      gradient: "linear-gradient(135deg,#f5576c,#f093fb)",
      icon: <Target size={40} color="white" />,
      button: t.start,
    },
  ];

  function handleCardKey(e, id) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      nav(`/grades/${id}`);
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
          background: theme, // ✅ replaced with selected theme
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
        {t.chooseDifficulty}
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
          width: "min(1200px, 92%)",
          zIndex: 90,
        }}
      >
        {levels.map((level) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleCardKey(e, level.id)}
            onClick={() => nav(`/grades/${level.id}`)}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.995 }}
            style={{
              flex: "1 1 340px",
              maxWidth: 370,
              minHeight: 420,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              padding: "28px 22px 34px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(255,255,255,0.08)",
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
                  width: 60,
                  height: 60,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: level.gradient,
                  boxShadow: `0 8px 22px rgba(0,0,0,0.28)`,
                }}
              >
                {level.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {level.title}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 700,
                  }}
                >
                  {level.gradesLine}
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
                margin: "20px 0 20px",
              }}
            >
              {level.description}
            </div>

            {/* Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nav(`/grades/${level.id}`);
              }}
              style={{
                width: "100%",
                background: level.gradient,
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {level.button}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 