// src/pages/LabGames.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Beaker, Leaf, TrendingUp, Sparkles, Aperture } from "lucide-react";
import { useLang } from "../state/LangContext";

const BASE_LABS = [
  {
    id: "physics",
    title: "Physics Lab",
    grade: "Interactive Experiments",
    desc:
      "Pendulum Pro, Circuit Lab, Spring–Mass Oscillator simulations with measurements and energy graphs.",
    color: "linear-gradient(90deg,#7c3aed,#a78bfa)",
    icon: <Zap size={34} />,
    experiments: [
      {
        id: "pendulum",
        title: "Pendulum Pro",
        grade: "Dynamics & Energy",
        desc: "Nonlinear pendulum with damping, energy plots, RK4 integration and phase-space.",
        path: "/games/lab/physics/pendulum",
        color: "linear-gradient(90deg,#60a5fa,#2563eb)",
        icon: <Sparkles size={28} />,
        btn: "Open",
      },
      {
        id: "circuit",
        title: "Circuit Lab",
        grade: "Electronics",
        desc: "Build circuits with resistors, batteries, LEDs, switches & wires. LEDs glow when current flows.",
        path: "/games/lab/physics/circuit",
        color: "linear-gradient(90deg,#f59e0b,#f97316)",
        icon: <Aperture size={28} />,
        btn: "Open",
      },
      {
        id: "spring",
        title: "Spring–Mass Oscillator",
        grade: "Hooke's Law",
        desc: "Spring–mass with damping, drag-to-set initial displacement, energy decomposition and phase-space.",
        path: "/games/lab/physics/spring",
        color: "linear-gradient(90deg,#34d399,#059669)",
        icon: <TrendingUp size={28} />,
        btn: "Open",
      },
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry Lab",
    grade: "Virtual Experiments",
    desc:
      "Explore titrations, puzzles and virtual reactions in a safe virtual chemistry lab.",
    color: "linear-gradient(90deg,#fb7185,#f97316)",
    icon: <Beaker size={34} />,
    experiments: [
      {
        id: "titration",
        title: "Titration Lab",
        grade: "Acid–Base",
        desc: "Perform titrations and plot pH curves.",
        path: "/games/lab/chemistry/titration",
        color: "linear-gradient(90deg,#fb7185,#f97316)",
        icon: <Beaker size={28} />,
        btn: "Open",
      },
      {
        id: "kinetics",
        title: "Periodic Table Puzzle",
        grade: "Elements & Groups",
        desc: "Solve interactive puzzles based on the periodic table.",
        path: "/games/lab/chemistry/kinetics",
        color: "linear-gradient(90deg,#fb7185,#fb923c)",
        icon: <Sparkles size={28} />,
        btn: "Open",
      },
      {
        id: "electro",
        title: "Mixing Lab",
        grade: "Reactions",
        desc: "Combine solutions in a beaker and observe the reactions.",
        path: "/games/lab/chemistry/electro",
        color: "linear-gradient(90deg,#fb7185,#ef4444)",
        icon: <Aperture size={28} />,
        btn: "Open",
      },
    ],
  },
  {
    id: "biology",
    title: "Biology Lab",
    grade: "Cell & Life Sciences",
    desc:
      "Simulations of ecosystems, genetics, and puzzles in an interactive environment.",
    color: "linear-gradient(90deg,#34d399,#059669)",
    icon: <Leaf size={34} />,
    experiments: [
      {
        id: "cell",
        title: "Food Chain Builder",
        grade: "Ecology",
        desc: "Arrange organisms into correct food chains and webs.",
        path: "/games/lab/biology/cell",
        color: "linear-gradient(90deg,#34d399,#10b981)",
        icon: <Aperture size={28} />,
        btn: "Open",
      },
      {
        id: "ecosystem",
        title: "Bio Scramble",
        grade: "Fun Puzzle",
        desc: "Unscramble biology terms and concepts to learn interactively.",
        path: "/games/lab/biology/ecosystem",
        color: "linear-gradient(90deg,#34d399,#06b6d4)",
        icon: <TrendingUp size={28} />,
        btn: "Open",
      },
      {
        id: "genetics",
        title: "Photosynthesis Puzzle",
        grade: "Plant Biology",
        desc: "Balance equations and test knowledge with interactive puzzles.",
        path: "/games/lab/biology/genetics",
        color: "linear-gradient(90deg,#34d399,#059669)",
        icon: <Sparkles size={28} />,
        btn: "Open",
      },
    ],
  },
];

// mappings
const labIdToKey = {
  physics: "physics_lab",
  chemistry: "chemistry_lab",
  biology: "biology_lab",
};
const expIdToKey = {
  pendulum: "pendulum_pro",
  circuit: "circuit_lab",
  spring: "spring_mass",
  titration: "titration_lab",
  kinetics: "periodic_table_puzzle",
  electro: "mixing_lab",
  cell: "food_chain",
  ecosystem: "bio_scramble",
  genetics: "photosynthesis_puzzle",
};

// Reusable card
function BigCard({ icon, title, grade, desc, color, onOpen, btnLabel }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      role="button"
      onClick={onOpen}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.05))",
        padding: 28,
        borderRadius: 16,
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 14px 40px rgba(2,6,23,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 360,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 14,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          marginBottom: 18,
        }}
      >
        {icon}
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 14 }}>{grade}</p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: 22, lineHeight: 1.7, textAlign: "justify" }}>
        {desc}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpen && onOpen();
        }}
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "14px 18px",
          borderRadius: 12,
          border: "none",
          fontWeight: 800,
          fontSize: 15,
          background: color,
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
        }}
      >
        {btnLabel}
      </button>
    </motion.div>
  );
}

// Main page
export default function LabGames() {
  const [selectedLabId, setSelectedLabId] = useState(null);
  const nav = useNavigate();
  const { t } = useLang();

  // Keep track of the last opened lab so the title toggle can reopen it
  const lastOpenedLabRef = useRef(null);

  // On mount: ensure baseline history state represents labs list
  useEffect(() => {
    try {
      // replace current state to a known baseline so popstate works predictably
      history.replaceState({ page: "labs" }, "");
    } catch (e) {
      // ignore if not allowed
    }

    const onPop = (e) => {
      const state = e.state || {};
      // if the popped state says labs -> close any opened lab
      if (state.page === "labs") {
        setSelectedLabId(null);
        return;
      }
      // if it's a lab state, open that lab
      if (state.page === "lab" && state.labId) {
        setSelectedLabId(state.labId);
        return;
      }
      // default fallback: close lab
      setSelectedLabId(null);
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Open a lab and push a history entry for it
  const openLab = useCallback((labId) => {
    setSelectedLabId(labId);
    lastOpenedLabRef.current = labId;
    try {
      history.pushState({ page: "lab", labId }, "");
    } catch (e) {
      // ignore
    }
  }, []);

  // Open an experiment: push a lab-state first so Back returns to the lab view,
  // then navigate to the experiment route (the browser will push the experiment entry).
  const openExperiment = useCallback(
    (labId, expPath) => {
      try {
        history.pushState({ page: "lab", labId }, "");
      } catch (e) {
        // ignore
      }
      // navigate to experiment (this creates the experiment history entry)
      nav(expPath);
    },
    [nav]
  );

  // Toggle the view when the title is clicked: if a lab is open -> close it.
  // if no lab is open -> reopen last opened lab (or the first lab as fallback).
  const toggleTitle = useCallback(() => {
    if (selectedLabId) {
      // close to labs list
      setSelectedLabId(null);
      try {
        history.pushState({ page: "labs" }, "");
      } catch (e) {
        // ignore
      }
      return;
    }
    // reopen last opened or fallback to first
    const toOpen = lastOpenedLabRef.current || (BASE_LABS[0] && BASE_LABS[0].id);
    if (toOpen) openLab(toOpen);
  }, [selectedLabId, openLab]);

  // keyboard handler for accessibility (Enter / Space)
  const onTitleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTitle();
    }
  };

  // merge translations
  const LABS = BASE_LABS.map((lab) => {
    const labKey = labIdToKey[lab.id] || lab.id;
    const translatedLab = (t && t.games && t.games[labKey]) || {};
    const experiments = (lab.experiments || []).map((exp) => {
      const expKey = expIdToKey[exp.id] || exp.id;
      const translatedExp = (t && t.games && t.games[expKey]) || {};
      return {
        ...exp,
        title: translatedExp.title || exp.title,
        grade: translatedExp.subtitle || exp.grade,
        desc: translatedExp.description || exp.desc,
        btn: translatedExp.btn || exp.btn || "Open",
      };
    });
    return {
      ...lab,
      title: translatedLab.title || lab.title,
      grade: translatedLab.subtitle || lab.grade,
      desc: translatedLab.description || lab.desc,
      experiments,
    };
  });

  const selectedLab = LABS.find((l) => l.id === selectedLabId);

  return (
    <div
      style={{
        position: "absolute",
        inset: "50px 0 0 0", // <- start at top (no gap)
        overflow: "auto",
        padding: "28px 32px",
        color: "#fff",
        background: "linear-gradient(180deg,#071129 0%, #0b1220 100%)" // optional if you want fixed theme
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1
          onClick={toggleTitle}
          onKeyDown={onTitleKeyDown}
          role="button"
          tabIndex={0}
          aria-pressed={!!selectedLabId}
          style={{
            fontSize: 42,
            fontWeight: 900,
            margin: 0,
            cursor: "pointer",
            userSelect: "none",
            display: "inline-block",
          }}
          title={selectedLabId ? "Click to close lab and return to list" : "Click to open last used lab"}
        >
          {t?.games?.lab_page_title || "Lab Games"}
        </h1>
        <p style={{ marginTop: 12, fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
          {t?.games?.lab_page_subtitle || "Choose a lab to explore interactive experiments"}
        </p>
      </div>

      {!selectedLab && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {LABS.map((lab) => (
            <BigCard
              key={lab.id}
              icon={lab.icon}
              title={lab.title}
              grade={lab.grade}
              desc={lab.desc}
              color={lab.color}
              onOpen={() => openLab(lab.id)}
              btnLabel={t?.games?.[labIdToKey[lab.id]]?.btn || "Open"}
            />
          ))}
        </div>
      )}

      {selectedLab && (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                background: selectedLab.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedLab.icon}
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>{selectedLab.title}</h2>
              <p style={{ marginTop: 6, color: "rgba(255,255,255,0.8)" }}>{selectedLab.desc}</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 28,
            }}
          >
            {selectedLab.experiments.map((exp) => (
              <BigCard
                key={exp.id}
                icon={exp.icon}
                title={exp.title}
                grade={exp.grade}
                desc={exp.desc}
                color={exp.color}
                onOpen={() => openExperiment(selectedLab.id, exp.path)}
                btnLabel={exp.btn}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 160 }} />
    </div>
  );
}