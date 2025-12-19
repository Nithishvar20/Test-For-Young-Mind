// src/components/AnimatedTileButton.jsx
import React from "react";
import { motion } from "framer-motion";

export default function AnimatedTileButton({
  id,
  title,
  subtitle,
  onClick,
  gradient = "linear-gradient(90deg,#4facfe,#00f2fe)",
  icon = null,
  aria = undefined,
}) {
  const itemVar = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 20 } },
  };

  return (
    <>
      <style>{`
        .tile-${id} {
          display:flex;
          gap:16px;
          align-items:center;
          justify-content:flex-start;
          padding:20px 24px;
          border-radius:16px;
          color: #fff;
          min-height:110px;
          width:100%;               /* 🔹 Full width button */
          box-shadow: 0 12px 30px rgba(2,6,23,0.45);
          border: 1px solid rgba(255,255,255,0.04);
          overflow:hidden;
          position:relative;
          cursor:pointer;
          transition: transform 250ms ease, box-shadow 250ms ease;
          margin-bottom: 18px;      /* 🔹 Extra space between buttons */
        }
        .tile-${id}:hover {
          transform: translateY(-10px) scale(1.08);  /* 🔹 Bigger hover effect */
          box-shadow: 0 24px 56px rgba(2,6,23,0.65);
        }
        .tile-${id} .icon-box {
          width:82px; height:82px;  /* 🔹 Larger icons */
          min-width:82px;
          border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          background: rgba(255,255,255,0.1);
          flex-shrink:0;
          transition: transform 260ms ease;
          box-shadow: inset 0 -6px 12px rgba(0,0,0,0.25);
        }
        .tile-${id}:hover .icon-box {
          transform: translateY(-6px) scale(1.12);
        }
        .tile-${id} h3 {
          margin:0;
          font-size:24px;
          font-weight:800;
          line-height:1.2;
          text-shadow: 0 6px 14px rgba(0,0,0,0.2);
        }
        .tile-${id} p {
          margin:6px 0 0 0;
          font-size:15px;
          opacity:0.95;
        }
        .tile-${id}::after {
          content:"";
          position:absolute;
          left:-40%; top:-20%;
          width:120%; height:160%;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0.02) 0%,
            rgba(255,255,255,0.06) 45%,
            rgba(255,255,255,0.02) 55%,
            rgba(255,255,255,0.02) 100%
          );
          transform: rotate(18deg) translateX(-50%);
          transition: transform 650ms cubic-bezier(.2,.9,.2,1), opacity 450ms;
          opacity:0;
          pointer-events:none;
        }
        .tile-${id}:hover::after { transform: rotate(18deg) translateX(30%); opacity:1; }
        @media (max-width:640px) {
          .tile-${id} { padding:14px 18px; min-height:90px; }
          .tile-${id} .icon-box { width:64px; height:64px; min-width:64px; }
        }
      `}</style>

      <motion.button
        className={`tile-${id}`}
        variants={itemVar}
        initial="hidden"
        animate="show"
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        aria-label={aria || title}
        style={{ background: gradient }}
      >
        <div className="icon-box" aria-hidden>
          {icon}
        </div>

        <div style={{ textAlign: "left", flex: 1 }}>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div style={{ marginLeft: 12, opacity: 0.95 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 6l6 6-6 6"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.button>
    </>
  );
}
