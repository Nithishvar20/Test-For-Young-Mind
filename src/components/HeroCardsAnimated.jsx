import React from "react";

export default function HeroCardsAnimated({ onAssessment, onGames }) {
  const cardBase = {
    width: 240,
    height: 240,
    borderRadius: 24,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
    border: "2px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
    cursor: "pointer",
    position: "relative",
    transition: "transform 240ms ease, box-shadow 240ms ease",
    overflow: "hidden",
    userSelect: "none",
  };

  const labelStyle = {
    width: "100%",
    textAlign: "center",
    fontWeight: 700,
    fontSize: 18,
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 14,
    background: "linear-gradient(90deg,#7e5bef,#a855f7)",
    boxShadow: "0 6px 20px rgba(126,91,239,0.5)",
    letterSpacing: "0.5px",
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .hero-card {
          animation: float 3.6s ease-in-out infinite;
        }
        .hero-card:hover {
          transform: translateY(-12px) scale(1.05) !important;
          box-shadow: 0 18px 48px rgba(138,92,246,0.6),
                      0 0 18px rgba(168,85,247,0.7);
        }

        .circle {
          width: 100px; height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #60a5fa, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          animation: pulse 2.2s ease-in-out infinite;
          box-shadow: 0 8px 20px rgba(59,130,246,0.6);
        }

        .square {
          width: 96px; height: 96px;
          border-radius: 20px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          animation: spin 5s linear infinite;
          box-shadow: 0 8px 20px rgba(219,39,119,0.6);
        }
      `}</style>

      <div
        style={{
          display: "flex",
          gap: 28,
          justifyContent: "center",
          marginTop: 28,
        }}
      >
        {/* Assessment Card */}
        <div
          role="button"
          className="hero-card"
          onClick={() => onAssessment && onAssessment()}
          style={cardBase}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="circle">📚</div>
          </div>
          <div style={labelStyle}>Start Assessment</div>
        </div>

        {/* Games Card */}
        <div
          role="button"
          className="hero-card"
          onClick={() => onGames && onGames()}
          style={cardBase}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="square">🎮</div>
          </div>
          <div style={labelStyle}>Games</div>
        </div>
      </div>
    </>
  );
}
