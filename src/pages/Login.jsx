// src/pages/Login.jsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function Login() {
  const auth = useAuth?.();
  const nav = useNavigate();

  if (!auth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <h2>AuthProvider not mounted</h2>
          <p>Wrap your app with &lt;AuthProvider&gt; in main.jsx / index.jsx</p>
        </div>
      </div>
    );
  }

  const { login } = auth;
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [place, setPlace] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setErr("");
      if (!name.trim() || !school.trim()) {
        setErr("Please enter both name and school.");
        return;
      }
      const payload = { name: name.trim(), school: school.trim(), place: place.trim() };
      try {
        login(payload);
        console.info("Login: saved payload ->", payload);
      } catch (ex) {
        console.error("Login: login() threw", ex);
        try {
          sessionStorage.setItem("sp_user", JSON.stringify(payload));
        } catch (e) {}
      }
      nav("/", { replace: true });
    },
    [name, school, place, login, nav]
  );

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden", // fixed page
        position: "relative",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {/* Fixed background gradient */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(180deg,#0f1724,#1b1027)",
          zIndex: -2,
        }}
      />

      {/* Logos (Top Left & Right) */}
      <img
        src="/logo-left.png"
        alt="Left logo"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          width: 115,
          height: 115,
          objectFit: "contain",
          zIndex: 1100,
          pointerEvents: "none",
        }}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />

      <img
        src="/logo-right.png"
        alt="Right logo"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: 115,
          height: 115,
          objectFit: "contain",
          zIndex: 1100,
          pointerEvents: "none",
        }}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />

      {/* Heading */}
      <div
        style={{
          position: "fixed",
          top: 28,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "#fff",
          zIndex: 1100,
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 35, fontWeight: 800 }}>
          SCIENCE PARK - Tiruvallur District
        </div>
        <div style={{ marginTop: 6, fontSize: 20, opacity: 0.95 }}>
          Developed by{" "}
          <span style={{ fontWeight: 800 }}>R.M.K. Engineering College</span>
        </div>
      </div>

      {/* Login Card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(960px, 96%)",
          display: "flex",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          background: "#fff",
          zIndex: 1000,
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{ flex: 1, padding: 36, background: "#fff", color: "#111" }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              textAlign: "center",
              color: "#111",
            }}
          >
            Student Login
          </h1>
          <p
            style={{
              textAlign: "center",
              marginTop: 6,
              fontSize: 22,
              color: "#555",
            }}
          >
            மாணவர் உள்நுழைவு
          </p>

          <label style={{ display: "block", marginTop: 18, fontWeight: 700 }}>
            Student Name / மாணவர் பெயர்
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 8,
            }}
            autoComplete="name"
          />

          <label style={{ display: "block", marginTop: 12, fontWeight: 700 }}>
            School Name / பள்ளியின் பெயர்
          </label>
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 8,
            }}
            autoComplete="organization"
          />

          <label style={{ display: "block", marginTop: 12, fontWeight: 700 }}>
            Place / இடம்
          </label>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 8,
            }}
            autoComplete="address-level2"
          />

          {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              type="submit"
              style={{
                padding: "15px 25px",
                borderRadius: 8,
                background: "#6b21a8",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </div>
        </form>

        <aside
          style={{
            width: 340,
            background: "linear-gradient(180deg,#6b21a8,#4c1d95)",
            color: "#fff",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
            Welcome
          </div>
          <div style={{ opacity: 0.95, lineHeight: 1.7 }}>
            <div>➙ Every quiz is a step closer to mastery.</div>
            <div>➙ Challenge your mind, discover your strength.</div>
            <div>➙ Knowledge is your superpower, unlock it here.</div>
            <div style={{ marginTop: 8 }}>
              ➙ ஒவ்வொரு வினாடி வினாவும் தேர்ச்சிக்கு ஒரு படி நெருக்கமாகும்.
            </div>
            <div>➙ உங்கள் மனதை சவால் செய்யுங்கள், உங்கள் பலத்தைக் கண்டறியவும்.</div>
            <div>➙ அறிவு உங்கள் வல்லமை, அதை இங்கே திறக்கவும்.</div>
          </div>
        </aside>
      </div>

            {/* Full-width footer card */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "rgba(255, 255, 255, 0.80)", // 37% opacity
          backdropFilter: "blur(6px)",              // keeps readability
          padding: "12px 20px",
          textAlign: "center",
          fontSize: 14,
          color: "#111",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
          zIndex: 1200,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          Compiled by (2023-2027 Batch - CSE)
        </p>
        <p style={{ margin: "4px 0" }}>
          Nithishvar A, Nikil Eeshwar E, Nithin R S, Prashanth R
        </p>
        <p style={{ margin: 0 }}>Mentor: Mr. M P Karthikeyan, M.Tech., (Ph.D)., Associate Professor / CSE</p>
      </footer>

      {/* Bottom-Right Logo with Text */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 1300,
        }}
      >
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#333", fontSize: 14 }}>
            Questions source:
          </p>
          <p style={{ margin: "4px 0 0", fontWeight: 400, color: "#333", fontSize: 14 }}>
            SCERT
          </p>
        </div>
        <img
          src="/logo-bottom-right.png"
          alt="Bottom Right Logo"
          style={{
            width: 60,
            height: 60,
            objectFit: "contain",
            pointerEvents: "none",
          }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>
    </div>
  );
}