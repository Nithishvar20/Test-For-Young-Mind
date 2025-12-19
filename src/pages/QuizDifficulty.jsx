// src/pages/QuizDifficulty.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, Award, Target, ChevronLeft } from "lucide-react";
import { useLang } from "../state/LangContext";
import { useTheme } from "../state/ThemeContext";

/**
 * QuizDifficulty.jsx
 * - Polished difficulty selection page with richer visuals & animations
 * - Responsive card grid, hover lifts, entrance motion, decorative accents
 * - Accessible: keyboard / ARIA hints, larger hit targets
 *
 * Drop this file into src/pages/QuizDifficulty.jsx (replace existing).
 */

export default function QuizDifficulty() {
  const nav = useNavigate();
  const { t } = useLang();
  const { theme } = useTheme();

  const difficulties = [
    {
      id: "BEGINNER",
      title: t.beginner || "Beginner",
      subtitle: t.levelIntro?.beginnerSubtitle || "Start with basics and simple questions.",
      gradient: "linear-gradient(135deg,#4facfe,#00f2fe)",
      accent: "#60a5fa",
      icon: <Rocket size={42} color="white" />,
    },
    {
      id: "INTERMEDIATE",
      title: t.intermediate || "Intermediate",
      subtitle: t.levelIntro?.intermediateSubtitle || "Test your growing knowledge with tougher ones.",
      gradient: "linear-gradient(135deg,#34d399,#059669)",
      accent: "#34d399",
      icon: <Award size={42} color="white" />,
    },
    {
      id: "ADVANCED",
      title: t.advanced || "Advanced",
      subtitle: t.levelIntro?.advancedSubtitle || "Challenge yourself with advanced level questions.",
      gradient: "linear-gradient(135deg,#f5576c,#f093fb)",
      accent: "#f472b6",
      icon: <Target size={42} color="white" />,
    },
  ];

  // Motion presets
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const cardMotion = {
    hidden: { opacity: 0, y: 18, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "auto",
        position: "relative",
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        color: "#fff",
        background: theme || "linear-gradient(180deg,#071129 0%, #0b1220 100%)",
        paddingBottom: 60,
      }}
    >
      {/* Soft background glows */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -50,
          pointerEvents: "none",
          background:
            "radial-gradient(600px 300px at 10% 10%, rgba(124,58,237,0.06), transparent 6%), radial-gradient(700px 420px at 90% 80%, rgba(96,165,250,0.04), transparent 8%)",
        }}
      />

      {/* Page header */}
      <div
        style={{
          maxWidth: 1200,
          margin: "24px auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
          }}
        >
          <ChevronLeft size={22} color="#fff" />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 700, letterSpacing: 0.6 }}>
            {t.assessmentHeading || "Assessment"}
          </div>
          <h1 style={{ margin: "6px 0 0", fontSize: 36, fontWeight: 900, lineHeight: 1.02 }}>
            {t.chooseDifficulty || "Choose Difficulty"}
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.7)", maxWidth: 900 }}>
            {t.chooseDifficultySubtitle ||
              "Pick a difficulty to match your learning stage. Each difficulty leads you to an appropriate grade list and timed quizzes."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.03)",
              fontWeight: 800,
              fontSize: 13,
            }}
            title="Tip"
          >
            🎯 Ready?
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          maxWidth: 1200,
          margin: "28px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        {difficulties.map((level, i) => (
          <motion.div
            key={level.id}
            variants={cardMotion}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") nav(`/grades/${level.id}`);
            }}
            onClick={() => nav(`/grades/${level.id}`)}
            whileHover={{ y: -8, boxShadow: "0 30px 80px rgba(2,6,23,0.6)", scale: 1.01 }}
            whileTap={{ scale: 0.995 }}
            style={{
              minHeight: 320,
              borderRadius: 16,
              padding: "26px",
              background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              outline: "none",
            }}
          >
            {/* floating accent */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: -40,
                top: -40,
                width: 220,
                height: 220,
                borderRadius: 999,
                background: `linear-gradient(135deg, ${level.accent}22, transparent 40%)`,
                filter: "blur(36px)",
                transform: "rotate(12deg)",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 14,
                  background: level.gradient,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
              >
                {level.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{level.title}</div>
                <div style={{ marginTop: 6, color: "rgba(255,255,255,0.78)", fontWeight: 700 }}>{level.id}</div>
              </div>
            </div>

            {/* Description */}
            <div style={{ flex: 1, fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>
              {level.subtitle}
            </div>

            {/* Footer actions */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nav(`/grades/${level.id}`);
                }}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: level.gradient,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
                }}
                aria-label={`Start ${level.title} quizzes`}
              >
                {t.start || "Start"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // preview action: show a quick modal / navigate to grade list for previewing
                  nav(`/grades/${level.id}`);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
                aria-label={`Preview ${level.title}`}
                title="Preview grade list"
              >
                Preview →
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Helpful footer / hint */}
      <div
        style={{
          maxWidth: 1200,
          margin: "18px auto",
          padding: "0 20px",
          color: "rgba(255,255,255,0.72)",
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          Tip: Choose a difficulty to see grade-wise quizzes. You can switch difficulty anytime.
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 800, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
            🔁 Auto-save
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Progress saved locally</div>
        </div>
      </div>
    </div>
  );
}