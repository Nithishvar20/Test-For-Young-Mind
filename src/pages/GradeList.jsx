// src/pages/GradeList.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLang } from "../state/LangContext";
import { BookOpen, Globe } from "lucide-react";
import { useTheme } from "../state/ThemeContext"; // ✅ added

export default function GradeList() {
  const { difficulty } = useParams();
  const nav = useNavigate();
  const { t = {}, lang = "EN" } = useLang();
  const { theme } = useTheme(); // ✅ use selected theme

  const map = {
    BEGINNER: [6, 7, 8],
    INTERMEDIATE: [9, 10],
    ADVANCED: [11, 12],
  };

  const grades = map[difficulty] || [];

  const gradientFor = (g) => {
    const palettes = [
      "linear-gradient(135deg,#7c3aed,#a78bfa)",
      "linear-gradient(135deg,#10b981,#34d399)",
      "linear-gradient(135deg,#f59e0b,#f97316)",
      "linear-gradient(135deg,#60a5fa,#4dd0e1)",
      "linear-gradient(135deg,#ff7a7a,#ff4d6d)",
    ];
    return palettes[g % palettes.length];
  };

  const makeIcon = (g) =>
    g < 9 ? <BookOpen size={40} color="white" /> : <Globe size={40} color="white" />;

  // fetch motivational texts from LangContext instead of hardcoding
  const getCardData = (g) => {
    const key = `grade${g}`;
    const card = t.gradeCard?.[key];
    if (!card) return { title: lang === "TA" ? `தரம் ${g}` : `Grade ${g}`, bullets: [] };
    return card;
  };

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
      {/* Background (uses selected theme) */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -300,
          background: theme, // ✅ replaced with selected theme
        }}
      />

      {/* Title */}
      <h1
        style={{
          position: "fixed",
          top: 110,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 40,
          fontWeight: 800,
          textShadow: "0 6px 20px rgba(0,0,0,0.6)",
          margin: 0,
          zIndex: 100,
        }}
      >
        {t.selectGrade || "Select Grade"}
      </h1>

      {/* Cards */}
      <div
        style={{
          position: "fixed",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          justifyContent: "center",
          width: "min(1200px, 92%)",
        }}
      >
        {grades.map((g) => {
          const card = getCardData(g);
          return (
            <div
              key={g}
              role="button"
              tabIndex={0}
              onClick={() => nav(`/subjects/${difficulty}/${g}`)}
              style={{
                flex: "1 1 300px",
                maxWidth: 340,
                minHeight: 420,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 18,
                padding: "28px 22px 34px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                backdropFilter: "blur(10px)",
                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 28px 70px rgba(0,0,0,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.45)";
              }}
            >
              {/* Icon + Title */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: gradientFor(g),
                    boxShadow: "0 8px 22px rgba(0,0,0,0.28)",
                  }}
                >
                  {makeIcon(g)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{card.title}</div>
                </div>
              </div>

              {/* Quotes */}
              <div
                style={{
                  margin: "24px 0 20px",
                  paddingLeft: 2,
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {card.bullets?.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: idx === card.bullets.length - 1 ? 0 : 8,
                    }}
                  >
                    <div style={{ fontSize: 18, lineHeight: "18px" }}>
                      {line.slice(0, 2)} {/* emoji at start */}
                    </div>
                    <div style={{ marginTop: 1 }}>{line.slice(2)}</div>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                onClick={() => nav(`/subjects/${difficulty}/${g}`)}
                style={{
                  width: "100%",
                  background: gradientFor(g),
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
              >
                {lang === "TA" ? "செல்லுங்கள்" : "Go"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}