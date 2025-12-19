// src/pages/LevelSelect.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLang } from "../state/LangContext";
import { Zap, Activity, Trophy } from "lucide-react";
import { useTheme } from "../state/ThemeContext"; // ✅ added theme hook

export default function LevelSelect() {
  const { difficulty, grade, subject } = useParams();
  const nav = useNavigate();
  const { t } = useLang();
  const { theme } = useTheme(); // ✅ read current theme

  const levels = [
    {
      id: "easy",
      label: t.levels?.easy || "Easy",
      desc: t.levelDescriptions?.easy,
      gradient: "linear-gradient(135deg,#34d399,#059669)",
      icon: <Zap size={38} color="white" />,
    },
    {
      id: "medium",
      label: t.levels?.medium || "Medium",
      desc: t.levelDescriptions?.medium,
      gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)",
      icon: <Activity size={38} color="white" />,
    },
    {
      id: "hard",
      label: t.levels?.hard || "Hard",
      desc: t.levelDescriptions?.hard,
      gradient: "linear-gradient(135deg,#ef4444,#b91c1c)",
      icon: <Trophy size={38} color="white" />,
    },
  ];

  const handleClick = (levelId) => {
    nav(`/quiz/${difficulty}/${grade}/${subject}/${levelId}`);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        /* ✅ use current theme if available, otherwise fall back to original gradient */
        background: theme || "linear-gradient(180deg,#071129 0%, #2b0f2f 100%)",
        backgroundAttachment: "fixed",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        paddingTop: 100,
        paddingBottom: 60,
      }}
    >
      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          fontSize: 38,
          fontWeight: 900,
          color: "#fff",
          marginBottom: 50,
        }}
      >
        {t.selectLevel || "Select Level"}
      </h1>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 32,
          padding: "0 20px",
        }}
      >
        {levels.map((lvl) => (
          <div
            key={lvl.id}
            style={{
              flex: "1 1 320px",
              maxWidth: 360,
              minHeight: 280,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => handleClick(lvl.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = `0 24px 70px ${lvl.gradient.split(",")[1]}55`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)";
            }}
          >
            {/* Icon & title */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: lvl.gradient,
                  boxShadow: `0 8px 20px ${lvl.gradient.split(",")[1]}77`,
                }}
              >
                {lvl.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
                  {lvl.label}
                </div>
                <div style={{ fontSize: 14, opacity: 0.8, color: "#fff" }}>
                  {t.gradeLabel ? t.gradeLabel(grade) : `Grade ${grade}`}
                </div>
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.5,
                marginTop: 20,
                flex: 1,
                textAlign: "justify",
              }}
            >
              {lvl.desc}
            </p>

            {/* CTA button */}
            <button
              style={{
                marginTop: 20,
                background: lvl.gradient,
                border: "none",
                padding: "12px 20px",
                borderRadius: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                fontSize: 15,
                boxShadow: `0 10px 25px ${lvl.gradient.split(",")[1]}88`,
                transition: "transform 0.15s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(lvl.id);
              }}
            >
              {t.startLevelCTA ? t.startLevelCTA(lvl.label) : `Start ${lvl.label}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}