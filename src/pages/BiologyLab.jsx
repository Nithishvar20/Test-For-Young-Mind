// src/pages/BiologyLab.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Dna, Globe } from "lucide-react";
import { useTheme } from "../state/ThemeContext"; // ✅ added

// Biology experiments
const BIO_EXPS = [
  {
    id: "cell",
    title: "Cell Explorer",
    grade: "Cell Biology",
    desc: "Explore the structure of a cell. Drag and match organelle names, view animations of energy cycles, and learn their functions.",
    path: "/games/lab/biology/cell",
    color: "linear-gradient(90deg,#22c55e,#16a34a)",
    icon: <Leaf size={34} />,
    btn: "Open",
  },
  {
    id: "genetics",
    title: "DNA Replication Challenge",
    grade: "Genetics",
    desc: "Match complementary base pairs (A-T, G-C) as the DNA strand unzips. Build a double helix while racing against time.",
    path: "/games/lab/biology/genetics",
    color: "linear-gradient(90deg,#a855f7,#7e22ce)",
    icon: <Dna size={34} />,
    btn: "Open",
  },
  {
    id: "ecosystem",
    title: "Ecosystem Balance Simulator",
    grade: "Ecology",
    desc: "Adjust populations of plants, rabbits, and wolves. Observe predator-prey dynamics and learn about ecosystem stability.",
    path: "/games/lab/biology/ecosystem",
    color: "linear-gradient(90deg,#3b82f6,#2563eb)",
    icon: <Globe size={34} />,
    btn: "Open",
  },
];

export default function BiologyLab() {
  const nav = useNavigate();
  const { theme } = useTheme(); // ✅ hook into theme

  return (
    <div
      style={{
        position: "absolute",
        inset: "72px 0 0 0",
        overflow: "auto",
        padding: "28px 32px",
        boxSizing: "border-box",
        color: "#fff",
        background: theme, // ✅ theme applied globally
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0 }}>Biology Lab</h1>
        <p style={{ marginTop: 12, fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
          Choose a biology experiment and dive into interactive life science activities.
        </p>
      </div>

      {/* Experiment Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 28,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {BIO_EXPS.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            role="button"
            onClick={() => nav(exp.path)}
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))",
              padding: 24,
              borderRadius: 16,
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 360,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background: exp.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                marginBottom: 18,
              }}
            >
              {exp.icon}
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>
              {exp.title}
            </h3>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
              {exp.grade}
            </p>

            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 22,
                lineHeight: 1.8,
                textAlign: "justify",
              }}
            >
              {exp.desc}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nav(exp.path);
              }}
              style={{
                marginTop: "auto",
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                fontWeight: 700,
                fontSize: 15,
                background: exp.color,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
              }}
            >
              {exp.btn}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}