// src/pages/Subjects.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLang } from "../state/LangContext";
import {
  BookOpen,
  Zap,
  Cpu,
  Atom,
  Calculator,
  Users,
  Globe,
  TestTube,
  Activity,
} from "lucide-react";
import { useTheme } from "../state/ThemeContext"; // ✅ added theme hook

export default function Subjects() {
  const { difficulty, grade } = useParams();
  const nav = useNavigate();
  const { t, lang = "EN" } = useLang();
  const { theme } = useTheme() || {}; // ✅ use theme background

  let subjects = ["english", "tamil", "maths", "science", "social"];
  if (Number(grade) === 9 || Number(grade) === 10) {
    subjects = [
      "english",
      "tamil",
      "maths",
      "physics",
      "chemistry",
      "biology",
      "social",
    ];
  }
  if (difficulty === "ADVANCED") {
    subjects = [
      "english",
      "tamil",
      "maths",
      "chemistry",
      "biology",
      "physics",
      "computer_science",
      "accountancy",
      "business_maths",
      "commerce",
      "economics",
    ];
  }

  const subjectMeta = {
    english: { color: "#7c3aed", icon: <BookOpen size={30} color="white" /> },
    tamil: { color: "#ef4444", icon: <BookOpen size={30} color="white" /> },
    maths: { color: "#3b82f6", icon: <Calculator size={30} color="white" /> },
    science: { color: "#10b981", icon: <Atom size={30} color="white" /> },
    physics: { color: "#60a5fa", icon: <Zap size={30} color="white" /> },
    chemistry: { color: "#f59e0b", icon: <TestTube size={30} color="white" /> },
    biology: { color: "#8b5cf6", icon: <Activity size={30} color="white" /> },
    computer_science: { color: "#22c55e", icon: <Cpu size={30} color="white" /> },
    accountancy: { color: "#facc15", icon: <Globe size={30} color="white" /> },
    commerce: { color: "#ec4899", icon: <Users size={30} color="white" /> },
    economics: { color: "#06b6d4", icon: <Globe size={30} color="white" /> },
    applied_maths: { color: "#0ea5e9", icon: <Calculator size={30} color="white" /> },
    programming: { color: "#3b82f6", icon: <Cpu size={30} color="white" /> },
    business_maths: { color: "#f97316", icon: <Calculator size={30} color="white" /> },
    social: { color: "#fbbf24", icon: <Globe size={30} color="white" /> },
  };

  const capitalize = (s) =>
    s
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  const getLabel = (s) =>
    lang === "TA" ? t?.subjects?.[s] || capitalize(s) : capitalize(s);

  const onClickSubject = (s) => {
    nav(`/level/${difficulty}/${grade}/${s}`);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: theme || "linear-gradient(180deg,#071129 0%, #2b0f2f 100%)", // ✅ use theme
        backgroundAttachment: "fixed",
        position: "relative",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {/* Title fixed */}
      <h1
        style={{
          position: "fixed",
          top: 88,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 34,
          fontWeight: 900,
          color: "#fff",
          zIndex: 1200,
          margin: 0,
          padding: "8px 16px",
        }}
      >
        {t?.selectSubject || "Select Subject"}
      </h1>

      {/* Hero panel fixed */}
      <div
        aria-label="Subjects panel"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          top: "calc(88px + 64px)",
          bottom: "80px",
          width: "min(1250px, 94%)",
          borderRadius: 22,
          padding: 40,
          background: "rgba(6,8,14,0.72)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 35px 90px rgba(2,6,23,0.65)",
          backdropFilter: "blur(10px)",
          zIndex: 1100,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            justifyItems: "center",
          }}
        >
          {subjects.map((s) => {
            const meta =
              subjectMeta[s] || { color: "#6366f1", icon: <BookOpen size={30} /> };
            return (
              <div
                key={s}
                role="button"
                tabIndex={0}
                onClick={() => onClickSubject(s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onClickSubject(s);
                }}
                style={{
                  width: "100%",
                  maxWidth: 360,
                  borderRadius: 16,
                  padding: 36,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.38)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 200,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow = `0 24px 60px ${meta.color}55`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "0 14px 40px rgba(0,0,0,0.38)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: meta.color,
                      boxShadow: `0 12px 24px ${meta.color}55`,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>
                      {getLabel(s)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onClickSubject(s);
                  }}
                  style={{
                    marginTop: 24,
                    width: "100%",
                    padding: "15px 20px",
                    borderRadius: 14,
                    border: "none",
                    fontWeight: 900,
                    cursor: "pointer",
                    fontSize: 16,
                    background: meta.color,
                    color: "#fff",
                    boxShadow: `0 10px 22px ${meta.color}88`,
                    zIndex: 1200,
                    pointerEvents: "auto",
                  }}
                >
                  {t?.open || (lang === "TA" ? "திற" : "Open")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}