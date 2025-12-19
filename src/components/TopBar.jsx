// src/components/TopBar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../state/LangContext";

export default function TopBar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { lang, toggle, t } = useLang();

  // hide TopBar on the front page
  if (loc.pathname === "/") return null;

  const showBack = loc.pathname !== "/";

  function handleBack() {
    // If we're on a nested lab route like:
    // /games/lab/<category>/<page>  -> go back to /games/lab/<category>
    // e.g. /games/lab/physics/circuit  -> /games/lab/physics
    const parts = loc.pathname.split("/").filter(Boolean); // removes empty strings
    // parts example: ["games","lab","physics","circuit"]
    if (parts[0] === "games" && parts[1] === "lab" && parts.length >= 4) {
      const parentCategory = parts[2];
      nav(`/games/lab/${parentCategory}`);
      return;
    }

    // If we're at the top-level lab listing, use existing heuristics
    if (loc.pathname === "/games/lab" && window.history.length <= 2) {
      nav("/games");
      return;
    }
    if (window.history.length > 2) {
      nav(-1);
    } else {
      nav("/games");
    }
  }

  return (
    <header
      role="banner"
      aria-label="Top navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        zIndex: 2000,
        background: "rgba(255,255,255,0.50)",
        backdropFilter: "saturate(120%) blur(6px)",
        boxShadow: "0 6px 18px rgba(2,6,23,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}
    >
      {/* Left side controls (Back + Home) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {showBack && (
          <button
            onClick={handleBack}
            style={{
              background: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
              border: "none",
              padding: "10px 18px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
              color: "#fff",
              fontSize: "0.95rem",
              boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
            }}
          >
            {t.back}
          </button>
        )}

        <button
          onClick={() => nav("/")}
          style={{
            background: "transparent",
            border: "none",
            fontWeight: 800,
            cursor: "pointer",
            fontSize: 15,
            color: "#0f1724",
            letterSpacing: "0.5px",
          }}
        >
          {t.home}
        </button>
      </div>

      {/* Right side controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Language toggle */}
        <button
          onClick={toggle}
          style={{
            background: "linear-gradient(90deg,#34d399,#059669)",
            border: "none",
            padding: "10px 18px",
            borderRadius: 12,
            fontWeight: 700,
            cursor: "pointer",
            color: "#fff",
            fontSize: "0.95rem",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
          }}
        >
          {lang === "EN" ? "தமிழ்" : "English"}
        </button>
      </div>
    </header>
  );
}