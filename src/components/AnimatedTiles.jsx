import React from "react";
import { motion } from "framer-motion";

/**
 * AnimatedTiles
 * - responsive grid of rectangular tiles
 * - left icon area + right label
 * - gradient color, hover shimmer, entrance animation, micro interactions
 *
 * Props:
 *  - items: [{ id, title, subtitle?, to?, gradient (css), icon (jsx) }]
 *  - onNavigate: fn(to) optional
 */

const defaultItems = [
  {
    id: "physics",
    title: "Physics",
    subtitle: "Mechanics & Forces",
    to: "/subjects/physics",
    gradient: "linear-gradient(90deg,#ff7a7a,#ff4d6d)", // red
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2v20" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="6" cy="7" r="1.6" fill="white" />
        <circle cx="18" cy="17" r="1.6" fill="white" />
      </svg>
    ),
  },
  {
    id: "biology",
    title: "Biology",
    subtitle: "Life & Cells",
    to: "/subjects/biology",
    gradient: "linear-gradient(90deg,#9b7bff,#b06efb)", // purple
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 3v6a6 6 0 0 0 12 0V3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 10c0 3 2 5 4 5s4-2 4-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "chemistry",
    title: "Chemistry",
    subtitle: "Reactions & Labs",
    to: "/subjects/chemistry",
    gradient: "linear-gradient(90deg,#42e695,#3bb2b8)", // green/teal
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 3v5c0 1.5 1 3 2.5 3.6V18a1 1 0 001 1h3a1 1 0 001-1v-6.4C16 11 17 9.5 17 8V3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="20" r="1.2" fill="white"/>
      </svg>
    ),
  },
  {
    id: "maths",
    title: "Maths",
    subtitle: "Numbers & Logic",
    to: "/subjects/maths",
    gradient: "linear-gradient(90deg,#60a5fa,#4dd0e1)", // blue
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function AnimatedTiles({ items = defaultItems, onNavigate }) {
  // framer variants
  const container = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
  };
  const itemVar = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 20 } },
  };

  return (
    <>
      <style>{`
        .tiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 12px;
        }

        .tile {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 18px 20px;
          border-radius: 14px;
          color: white;
          box-shadow: 0 12px 30px rgba(2,6,23,0.45);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.04);
          transition: transform 220ms ease, box-shadow 220ms ease;
          min-height: 92px;
        }

        /* left icon tile */
        .tile .icon-box {
          width: 72px;
          height: 72px;
          min-width: 72px;
          border-radius: 12px;
          display:flex;
          align-items:center;
          justify-content:center;
          background: rgba(255,255,255,0.08);
          box-shadow: inset 0 -6px 12px rgba(0,0,0,0.25);
          flex-shrink: 0;
          transition: transform 260ms ease;
        }

        .tile h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          line-height: 1;
        }

        .tile p {
          margin: 4px 0 0 0;
          font-size: 13px;
          opacity: 0.9;
        }

        /* hover: lift + icon pop + shimmer */
        .tile:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 48px rgba(2,6,23,0.55);
        }
        .tile:hover .icon-box { transform: translateY(-6px) scale(1.06); }

        /* shimmer stripe */
        .tile::after {
          content: "";
          position: absolute;
          left: -40%;
          top: -20%;
          width: 120%;
          height: 160%;
          background: linear-gradient(120deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.02) 100%);
          transform: rotate(18deg) translateX(-50%);
          transition: transform 650ms cubic-bezier(.2,.9,.2,1), opacity 450ms;
          opacity: 0;
          pointer-events: none;
        }
        .tile:hover::after {
          transform: rotate(18deg) translateX(30%);
          opacity: 1;
        }

        /* small bounce when clicked (handled by framer-motion) */
        @media (max-width: 640px) {
          .tiles-grid { gap: 14px; padding: 8px; }
          .tile { padding: 14px; min-height: 80px; }
          .tile .icon-box { width: 62px; height: 62px; min-width: 62px; }
        }
      `}</style>

      {/* NOTE: position: fixed added below so this grid stays fixed in the viewport */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="tiles-grid"
        role="list"
        style={{
          position: "fixed",
          top: "12vh",               // adjust as needed to sit below headers / topbars
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          // optional: keep within viewport width; tiles-grid already has max-width
          width: "100%",
          display: "grid",
          placeItems: "center",
        }}
      >
        {items.map((it, idx) => (
          <motion.button
            key={it.id || idx}
            variants={itemVar}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate ? onNavigate(it.to) : it.to && (window.location.href = it.to)}
            className="tile"
            aria-label={it.title}
            role="listitem"
            title={it.title + (it.subtitle ? " — " + it.subtitle : "")}
          >
            <div
              className="icon-box"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.06)",
                // subtle inner radial highlight using same gradient as tile but muted:
                boxShadow: "inset 0 -6px 14px rgba(0,0,0,0.25), 0 6px 14px rgba(0,0,0,0.18)",
              }}
            >
              {/* icon wrapper can have a tiny float animation */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: idx * 0.15 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {it.icon}
              </motion.div>
            </div>

            <div style={{ textAlign: "left", flex: 1 }}>
              <h3 style={{ textShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>{it.title}</h3>
              {it.subtitle && <p>{it.subtitle}</p>}
            </div>

            {/* decorative small chevron */}
            <div style={{ marginLeft: 12, opacity: 0.95 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* dynamic background via inline style on button (we set it below) */}
            <style>{`
              /* per-item gradient injection */
              #tile-bg-${it.id} { background: ${it.gradient}; }
            `}</style>
            {/* apply id on the element so we can target it from style above */}
            <span id={`tile-bg-${it.id}`} style={{ display: "none" }} />
          </motion.button>
        ))}
      </motion.div>

      {/* inject per-tile gradient by setting background inline (so we don't rely on extra stylesheet rules) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            const tiles = Array.from(document.querySelectorAll('.tile'));
            tiles.forEach((el, i) => {
              const grad = ${JSON.stringify(items.map((it) => it.gradient || "#777"))}[i] || ${JSON.stringify(items[0].gradient)};
              el.style.background = grad;
            });
          })();
        `,
        }}
      />
    </>
  );
}