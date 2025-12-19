// src/components/biology/PhotosynthesisPuzzle.jsx
import React, { useEffect, useRef, useState } from "react";

const TOPBAR_HEIGHT = 72;

/* --- Question banks --- */
const PRODUCTS_BANK = [
  { id: "p1", text: "Which molecules are the primary products of photosynthesis?", options: [{id:"gluc",label:"Glucose"}, {id:"o2",label:"Oxygen"}, {id:"co2",label:"CO₂"}], correct: "gluc" },
  { id: "p2", text: "Which product is produced in greatest chemical energy for the plant?", options: [{id:"starch",label:"Starch"}, {id:"gluc",label:"Glucose"}, {id:"o2",label:"Oxygen"}], correct: "gluc" },
  { id: "p3", text: "Which gas is released by plants during photosynthesis?", options: [{id:"co2",label:"CO₂"}, {id:"o2",label:"Oxygen"}, {id:"h2o",label:"Water Vapour"}], correct: "o2" },
  { id: "p4", text: "Which is the sugar directly produced by the Calvin cycle?", options: [{id:"gluc",label:"Glucose"}, {id:"g3p",label:"G3P"}, {id:"fruc",label:"Fructose"}], correct: "g3p" },
  { id: "p5", text: "Which two final products are made usable for plant growth?", options: [{id:"gluc_o2",label:"Glucose & Oxygen"}, {id:"co2_h2o",label:"CO₂ & Water"}, {id:"h2o_o2",label:"Water & Oxygen"}], correct: "gluc_o2" },
  { id: "p6", text: "Photosynthesis stores energy in which chemical form?", options: [{id:"atp",label:"ATP"}, {id:"gluc",label:"Glucose"}, {id:"o2",label:"Oxygen"}], correct: "gluc" },
  { id: "p7", text: "Which product is exported from leaves to the rest of the plant?", options: [{id:"sugars",label:"Sugars (sucrose) "}, {id:"o2",label:"Oxygen"}, {id:"starch",label:"Starch"}], correct: "sugars" },
  { id: "p8", text: "Which product is a by-product of the light reactions?", options: [{id:"o2",label:"Oxygen"}, {id:"gluc",label:"Glucose"}, {id:"nadph",label:"NADPH"}], correct: "o2" },
  { id: "p9", text: "Which product is directly used in cellular respiration of the plant?", options: [{id:"co2",label:"CO₂"}, {id:"gluc",label:"Glucose"}, {id:"o2",label:"Oxygen"}], correct: "gluc" },
  { id: "p10", text: "What is the main carbohydrate produced as photosynthetic product?", options: [{id:"cellulose",label:"Cellulose"}, {id:"gluc",label:"Glucose"}, {id:"fruc",label:"Fructose"}], correct: "gluc" },
];

const MECHANISM_BANK = [
  { id: "m1", text: "Which energy source drives photosynthesis?", options: [{id:"light",label:"Light"}, {id:"heat",label:"Heat"}, {id:"chemical",label:"Chemical"}], correct: "light" },
  { id: "m2", text: "Which organelle carries out photosynthesis?", options: [{id:"mito",label:"Mitochondria"}, {id:"chlo",label:"Chloroplast"}, {id:"nuc",label:"Nucleus"}], correct: "chlo" },
  { id: "m3", text: "Where are chlorophyll pigments located?", options: [{id:"stroma",label:"Stroma"}, {id:"thylakoid",label:"Thylakoid membranes"}, {id:"pel",label:"Cell wall"}], correct: "thylakoid" },
  { id: "m4", text: "Which process produces ATP in the light reactions?", options: [{id:"photophos",label:"Photophosphorylation"}, {id:"gly",label:"Glycolysis"}, {id:"krebs",label:"Krebs cycle"}], correct: "photophos" },
  { id: "m5", text: "What donates electrons in the light reactions?", options: [{id:"h2o",label:"Water"}, {id:"co2",label:"CO₂"}, {id:"o2",label:"O₂"}], correct: "h2o" },
  { id: "m6", text: "Which pigment captures light energy?", options: [{id:"chlorophyll",label:"Chlorophyll"}, {id:"carotene",label:"Carotene"}, {id:"hemoglobin",label:"Hemoglobin"}], correct: "chlorophyll" },
  { id: "m7", text: "The Calvin cycle uses what to fix CO₂?", options: [{id:"nadph",label:"NADPH"}, {id:"atp",label:"ATP"}, {id:"both",label:"ATP & NADPH"}], correct: "both" },
  { id: "m8", text: "Which step directly splits water?", options: [{id:"photolysis",label:"Photolysis"}, {id:"fixation",label:"Carbon fixation"}, {id:"reduction",label:"Reduction"}], correct: "photolysis" },
  { id: "m9", text: "Where does the Calvin cycle occur?", options: [{id:"stroma",label:"Stroma"}, {id:"thylakoid",label:"Thylakoid lumen"}, {id:"cytoplasm",label:"Cytoplasm"}], correct: "stroma" },
  { id: "m10", text: "Which compound is regenerated to accept CO₂ (Rubisco uses it)?", options: [{id:"ribulose",label:"Ribulose bisphosphate (RuBP)"}, {id:"atp",label:"ATP"}, {id:"nadph",label:"NADPH"}], correct: "ribulose" },
];

const BALANCE_BANK = [
  { id: "b1", text: "What is the balanced equation product count for O₂ from 6 CO₂ + 6 H₂O ?", options: [{id:"6",label:"6 O₂"}, {id:"3",label:"3 O₂"}, {id:"1",label:"1 O₂"}], correct: "6" },
  { id: "b2", text: "How many CO₂ molecules are needed to make one glucose (C₆H₁₂O₆)?", options: [{id:"6",label:"6"}, {id:"3",label:"3"}, {id:"12",label:"12"}], correct: "6" },
  { id: "b3", text: "In the simplified net photosynthesis reaction, how many water molecules are reactants?", options: [{id:"6",label:"6"}, {id:"12",label:"12"}, {id:"3",label:"3"}], correct: "6" },
  { id: "b4", text: "Balance check: If glucose has 6 carbons, how many CO₂ provide them?", options: [{id:"6",label:"6 CO₂"}, {id:"3",label:"3 CO₂"}, {id:"12",label:"12 CO₂"}], correct: "6" },
  { id: "b5", text: "How many oxygen atoms appear in one glucose molecule (C₆H₁₂O₆)?", options: [{id:"6",label:"6"}, {id:"3",label:"3"}, {id:"12",label:"12"}], correct: "6" },
  { id: "b6", text: "If 6 CO₂ are used, how many O₂ molecules are produced in net equation?", options: [{id:"6",label:"6 O₂"}, {id:"3",label:"3 O₂"}, {id:"12",label:"12 O₂"}], correct: "6" },
  { id: "b7", text: "Which atoms must balance in photosynthesis final product? (choose main ones)", options: [{id:"cho",label:"C, H, O"}, {id:"co",label:"C, O only"}, {id:"h",label:"H only"}], correct: "cho" },
  { id: "b8", text: "To create one glucose, how many hydrogen atoms come from water?", options: [{id:"12",label:"12 H"}, {id:"6",label:"6 H"}, {id:"24",label:"24 H"}], correct: "12" },
  { id: "b9", text: "If you doubled CO₂ input, glucose output would (theoretically):", options: [{id:"double",label:"Double"}, {id:"same",label:"Stay same"}, {id:"half",label:"Halve"}], correct: "double" },
  { id: "b10", text: "Which side should have equal C atoms in balanced equation?", options: [{id:"reactants",label:"Reactants & Products"}, {id:"reactants_only",label:"Reactants only"}, {id:"products_only",label:"Products only"}], correct: "reactants" },
];

/* --- Helper --- */
function randomIndexExcept(len, except) {
  if (len <= 1) return 0;
  let i = Math.floor(Math.random() * len);
  if (i === except) i = (i + 1) % len;
  return i;
}

function initRandomIndices() {
  return {
    Products: Math.floor(Math.random() * PRODUCTS_BANK.length),
    Mechanism: Math.floor(Math.random() * MECHANISM_BANK.length),
    Balance: Math.floor(Math.random() * BALANCE_BANK.length),
  };
}

export default function PhotosynthesisPuzzle() {
  const [activeTab, setActiveTab] = useState("Products"); // default open
  const [qIndex, setQIndex] = useState(() => initRandomIndices());
  const [selection, setSelection] = useState({ Products: null, Mechanism: null, Balance: null });
  const [feedback, setFeedback] = useState(null);

  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  function getBank(tab) {
    if (tab === "Products") return PRODUCTS_BANK;
    if (tab === "Mechanism") return MECHANISM_BANK;
    return BALANCE_BANK;
  }

  function currentQuestion(tab) {
    const bank = getBank(tab);
    const idx = qIndex[tab];
    return bank[idx];
  }

  function handleSwitchTab(tab) {
    if (tab === activeTab) return;
    const bank = getBank(tab);
    const nextIdx = randomIndexExcept(bank.length, qIndex[tab]);
    setQIndex((s) => ({ ...s, [tab]: nextIdx }));
    setSelection((s) => ({ ...s, [tab]: null }));
    setFeedback(null);
    setActiveTab(tab);
  }

  function handleSelectOption(tab, id) {
    setSelection((s) => ({ ...s, [tab]: s[tab] === id ? null : id }));
    setFeedback(null);
  }

  function handleCheck() {
    const tab = activeTabRef.current;
    const q = currentQuestion(tab);
    const sel = selection[tab];
    if (!sel) return setFeedback({ ok: false, message: "Select an option first." });
    setFeedback({
      ok: q.correct === sel,
      message: q.correct === sel ? "✅ Correct!" : "❌ Incorrect — Try again.",
    });
  }

  function handleReset() {
    setQIndex(initRandomIndices());
    setSelection({ Products: null, Mechanism: null, Balance: null });
    setFeedback(null);
  }

  /* --- UI elements --- */
  function OptionButton({ tab, opt }) {
    const selected = selection[tab] === opt.id;
    return (
      <button
        onClick={() => handleSelectOption(tab, opt.id)}
        aria-pressed={selected}
        style={{
          flex: "1 1 30%",
          minWidth: 180,
          padding: "18px 20px",
          borderRadius: 14,
          border: selected ? "3px solid #60a5fa" : "1px solid rgba(255,255,255,0.05)",
          background: selected ? "linear-gradient(90deg,#60a5fa,#2563eb)" : "rgba(255,255,255,0.04)",
          color: selected ? "#04111a" : "#fff",
          fontSize: 18,
          fontWeight: 800,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.14s ease",
        }}
      >
        {opt.label}
      </button>
    );
  }

  const pageStyle = {
    paddingTop: TOPBAR_HEIGHT + 10,
    minHeight: "100vh",
    background: "linear-gradient(180deg,#060c1e,#0a1029)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const card = {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 20px 60px rgba(2,6,23,0.6)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const btnBase = {
    padding: "14px 20px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
  };

  return (
    <div style={pageStyle}>
      {/* Single wide centered card (removed sidebar) */}
      <div
        style={{
          maxWidth: 1000,
          width: "90%",
        }}
      >
        <div
          style={{
            ...card,
            width: "100%",
            minHeight: "70vh",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 900,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🌿 Photosynthesis Puzzle
            </h1>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {["Products", "Balance", "Mechanism"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleSwitchTab(t)}
                  style={{
                    ...btnBase,
                    background: activeTab === t ? "linear-gradient(90deg,#7c3aed,#60a5fa)" : "rgba(255,255,255,0.06)",
                    color: activeTab === t ? "#fff" : "#b9c5e0",
                    flex: 1,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Question */}
            <div style={{ marginTop: 30 }}>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>
                {activeTab} — Question
              </div>
              <div style={{ fontSize: 22, color: "#e8eef8", fontWeight: 500 }}>
                {currentQuestion(activeTab)?.text}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 18,
                  marginTop: 30,
                }}
              >
                {currentQuestion(activeTab)?.options.map((opt) => (
                  <OptionButton key={opt.id} tab={activeTab} opt={opt} />
                ))}
              </div>

              <div aria-live="polite" style={{ minHeight: 40 }}>
                {feedback && (
                  <div
                    style={{
                      marginTop: 28,
                      padding: 16,
                      borderRadius: 14,
                      background: feedback.ok ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.12)",
                      color: feedback.ok ? "#a7f3d0" : "#fecaca",
                      fontWeight: 800,
                      fontSize: 20,
                      textAlign: "center",
                    }}
                  >
                    {feedback.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
            <button
              onClick={handleCheck}
              style={{
                ...btnBase,
                background: "linear-gradient(90deg,#10b981,#34d399)",
                color: "#04111a",
                flex: 1,
                fontSize: 20,
              }}
            >
              Check
            </button>
            <button
              onClick={handleReset}
              style={{
                ...btnBase,
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                flex: 1,
                fontSize: 20,
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}