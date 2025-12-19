// src/pages/Front.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../state/AuthContext";

export default function Front() {
  const nav = useNavigate();
  const auth = useAuth?.();

  // fallback user (sessionStorage or placeholder)
  const fallbackUser = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("sp_user");
      if (raw) return JSON.parse(raw);
    } catch {}
    return { name: "Guest User", school: "No School" };
  }, []);

  const user = auth?.user || fallbackUser;
  const logout = auth?.logout || (() => {
    try { sessionStorage.removeItem("sp_user"); } catch {}
  });

  const initials = (name = "") =>
    (name || "")
      .split(" ")
      .map((s) => s[0] || "")
      .slice(0, 2)
      .join("")
      .toUpperCase();

  function handleLogout() {
    try {
      logout();
    } catch {
      try { sessionStorage.removeItem("sp_user"); } catch {}
    }
    nav("/login", { replace: true });
  }

  const HEADER_HEIGHT = 76; // keep in sync with CSS below

  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden", //prevent scrolling
        position: "relative",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        color: "#fff",
      }}
    >
      {/* fixed background */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -100,
          background:
            "radial-gradient(ellipse at 10% 20%, rgba(123,31,162,0.12) 0%, transparent 8%), radial-gradient(ellipse at 90% 80%, rgba(99,102,241,0.10) 0%, transparent 12%), linear-gradient(180deg,#071129 0%, #2b0f2f 100%)",
          backgroundAttachment: "fixed",
        }}
      />

      {/* subtle vignette */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -90,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 55%)",
        }}
      />

      {/* Full-width header - white with 80% opacity */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 28px",
          background: "rgba(255,255,255,0.50)", // 80% white
          backdropFilter: "blur(6px)",
          boxShadow: "0 6px 20px rgba(2,6,23,0.18)",
          zIndex: 2000,
          color: "#0f1724",
        }}
      >
        {/* Left: user card (name + school only) */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            aria-hidden
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              boxShadow: "0 8px 18px rgba(139,92,246,0.18)",
            }}
          >
            {initials(user.name)}
          </div>

          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0b1220" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 13, color: "#374151", opacity: 0.9 }}>
              {user.school || " "}
            </div>
          </div>
        </div>

        {/* Right: nav + logout */}
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => nav("/leaderboard")}
            style={{
              background: "transparent",
              border: "none",
              color: "#0b1220",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: 10,
            }}
          >
            Leaderboard
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(90deg,#fb7185,#fb6a4e)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(251,113,133,0.18)",
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* spacer so content doesn't sit under header */}
      <div style={{ height: HEADER_HEIGHT }} aria-hidden />

      {/* ===== HERO PANEL - TRULY FIXED: will NOT move ===== */}
      <div
        role="region"
        aria-label="Hero panel"
        style={{
          position: "fixed",              // fixed: will not move with scroll
          top: `calc(50% + ${HEADER_HEIGHT / 2}px)`, // center visually below header
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(1100px, 95%)",
          textAlign: "center",
          borderRadius: 20,
          padding: "48px 32px",
          background: "rgba(20,20,35,0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(2,6,23,0.7)",
          backdropFilter: "blur(10px)",
          zIndex: 1000,
          // disable text selection to reduce accidental drag-like interaction
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "3rem", fontWeight: 900, color: "#fff" }}>
          Science Quiz for Young Achievers
        </h1>
        <p style={{ marginTop: 12, color: "rgba(255,255,255,0.9)", fontSize: 21 }}>
          இளைய சிந்தனையாளர்களுக்கான அறிவியல் வினாடி வினா
        </p>

        <div
          style={{
            display: "flex",
            gap: 48,
            justifyContent: "center",
            marginTop: 36,
            flexWrap: "wrap",
          }}
        >
          {/* Start Assessment card - using your original logo unchanged */}
          <div
            role="button"
            onClick={() => nav("/choose")}
            style={{
              width: 260,
              height: 260,
              borderRadius: 18,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              background: "rgba(255,255,255,0.12)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.6)",
              cursor: "pointer",
              transition: "transform .18s ease, box-shadow .18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 30px 80px rgba(0,0,0,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 18px 48px rgba(0,0,0,0.6)";
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
              }}
            >
              {/* logo exactly as provided (no added border, no ring) */}
              <img
                src="/logo-study.png"
                alt="Study logo"
                style={{
                  width: 110,
                  height: 110,
                  objectFit: "contain",
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            <div
              style={{
                marginTop: 6,
                background: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 999,
                fontWeight: 800,
              }}
            >
              Assessment
            </div>
          </div>

          {/* Games card - logo unchanged */}
          <div
            role="button"
            onClick={() => nav("/games")}
            style={{
              width: 260,
              height: 260,
              borderRadius: 18,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              background: "rgba(255,255,255,0.12)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.6)",
              cursor: "pointer",
              transition: "transform .18s ease, box-shadow .18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 30px 80px rgba(0,0,0,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 18px 48px rgba(0,0,0,0.6)";
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
              }}
            >
              {/* logo exactly as provided (no added border, no ring) */}
              <img
                src="/logo-games.png"
                alt="Games logo"
                style={{
                  width: 110,
                  height: 110,
                  objectFit: "contain",
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            <div
              style={{
                marginTop: 6,
                background: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 999,
                fontWeight: 800,
              }}
            >
              Games
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}