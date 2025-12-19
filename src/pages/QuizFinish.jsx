// src/pages/QuizFinish.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { saveQuizResult } from "./Leaderboard"; // relative path — adjust if different
import { useAuth } from "../state/AuthContext"; // optional
import { useTheme } from "../state/ThemeContext"; // ✅ added theme

export default function QuizFinish({ score, timeSec, extraMeta }) {
  const navigate = useNavigate();
  const { user } = useAuth?.() || {};
  const { theme } = useTheme(); // ✅ current theme

  const name =
    user?.name ||
    window.prompt("Enter name to record result:", "Player") ||
    "Anonymous";

  const handleSaveAndShowLeaderboard = () => {
    const entry = saveQuizResult({
      name,
      score,
      timeSec,
      meta: extraMeta ?? null,
    });
    console.log("Saved quiz result to local leaderboard:", entry);
    navigate("/leaderboard");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff",
        background: theme || "linear-gradient(180deg,#071129 0%, #2b0f2f 100%)", // ✅ theme applied
        padding: 20,
      }}
    >
      <h2>Your score: {score}</h2>
      <div>Time: {timeSec ? `${timeSec}s` : "—"}</div>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleSaveAndShowLeaderboard}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          }}
        >
          Save & View Leaderboard
        </button>
      </div>
    </div>
  );
}