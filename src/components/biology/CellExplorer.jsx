// src/pages/FoodChain.jsx
import React, { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti"; // 🎉 popper effect

/**
 * Food Chain Builder
 * - 3-column layout: Palette | Slots | Inspector
 * - Fixed dark background
 * - Tile text colors corrected for visibility
 */

const SPECIES_DB = {
  forest: [
    { id: "tree", name: "Tree", role: "producer", desc: "Makes food via photosynthesis.", icon: "🌳" },
    { id: "grass", name: "Grass", role: "producer", desc: "Ground vegetation, food source.", icon: "🌾" },
    { id: "rabbit", name: "Rabbit", role: "primary", desc: "Herbivore — eats plants.", icon: "🐇" },
    { id: "deer", name: "Deer", role: "primary", desc: "Primary consumer — eats plants.", icon: "🦌" },
    { id: "fox", name: "Fox", role: "secondary", desc: "Small predator — eats primary consumers.", icon: "🦊" },
    { id: "hawk", name: "Hawk", role: "secondary", desc: "Bird of prey — eats small animals.", icon: "🦅" },
    { id: "wolf", name: "Wolf", role: "tertiary", desc: "Apex predator in forests.", icon: "🐺" },
  ],
  ocean: [
    { id: "algae", name: "Algae", role: "producer", desc: "Photosynthetic base of ocean food webs.", icon: "🪸" },
    { id: "plankton", name: "Plankton", role: "producer", desc: "Microscopic producers floating in water.", icon: "🌊" },
    { id: "krill", name: "Krill", role: "primary", desc: "Small crustaceans that feed on plankton.", icon: "🦐" },
    { id: "fish", name: "Fish", role: "secondary", desc: "Small fish eating krill.", icon: "🐟" },
    { id: "seal", name: "Seal", role: "secondary", desc: "Marine predator, eats fish.", icon: "🦭" },
    { id: "shark", name: "Shark", role: "tertiary", desc: "Apex predator in oceans.", icon: "🦈" },
  ],
  desert: [
    { id: "cactus", name: "Cactus", role: "producer", desc: "Stores water, makes food via photosynthesis.", icon: "🌵" },
    { id: "drygrass", name: "Dry Grass", role: "producer", desc: "Sparse desert vegetation.", icon: "🌱" },
    { id: "rat", name: "Kangaroo Rat", role: "primary", desc: "Eats seeds & plants.", icon: "🐀" },
    { id: "snake", name: "Snake", role: "secondary", desc: "Feeds on rodents.", icon: "🐍" },
    { id: "hawk2", name: "Hawk", role: "tertiary", desc: "Apex predator in desert skies.", icon: "🦅" },
  ],
};

const LEVEL = { roles: ["producer", "primary", "secondary", "tertiary"] };

function Tile({ species, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(species)}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "14px 16px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: selected ? "rgba(255,255,255,0.06)" : "transparent",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
      }}
      aria-pressed={!!selected}
    >
      <div style={{ fontSize: 24 }}>{species.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{species.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 6 }}>
          {species.desc}
        </div>
      </div>
    </button>
  );
}

function Slot({ needRole, placed, onTap, status }) {
  const borderColor =
    status === "correct"
      ? "rgba(34,197,94,0.95)"
      : status === "incorrect"
      ? "rgba(239,68,68,0.95)"
      : "rgba(255,255,255,0.1)";

  return (
    <div
      onClick={onTap}
      role="button"
      tabIndex={0}
      style={{
        height: 170,
        borderRadius: 12,
        padding: 18,
        border: `2px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.02))",
      }}
    >
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginBottom: 8 }}>
        Needs: <b style={{ textTransform: "capitalize" }}>{needRole}</b>
      </div>

      {placed ? (
        <>
          <div style={{ fontSize: 36 }}>{placed.icon}</div>
          <div style={{ marginTop: 8, fontWeight: 800, color: "#fff" }}>{placed.name}</div>
          <div
            style={{
              marginTop: 8,
              color: status === "correct" ? "#22c55e" : "#ef4444",
              fontWeight: 700,
            }}
          >
            {status === "correct" ? "Correct" : "Incorrect"}
          </div>
        </>
      ) : (
        <div style={{ color: "rgba(255,255,255,0.5)" }}>Tap to place</div>
      )}
    </div>
  );
}

export default function FoodChain() {
  const [ecosystem, setEcosystem] = useState("forest");
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [slots, setSlots] = useState(LEVEL.roles.map(() => null));
  const [slotStatus, setSlotStatus] = useState(LEVEL.roles.map(() => null));
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const speciesList = useMemo(() => SPECIES_DB[ecosystem] || [], [ecosystem]);

  // 🎉 Confetti effect when correct
  function triggerConfetti() {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#4ade80", "#86efac"],
    });
  }

  function handleSlotTap(i) {
    if (!selectedSpecies) return;
    const correctRole = LEVEL.roles[i];
    const isCorrect = selectedSpecies.role === correctRole;

    setSlots((prev) => {
      const copy = [...prev];
      copy[i] = selectedSpecies;
      return copy;
    });

    setSlotStatus((prev) => {
      const copy = [...prev];
      copy[i] = isCorrect ? "correct" : "incorrect";
      return copy;
    });

    setScore((s) => s + (isCorrect ? 10 : -5));
    setSelectedSpecies(null);

    if (isCorrect) triggerConfetti(); // 🎉
  }

  function resetLevel() {
    setSlots(LEVEL.roles.map(() => null));
    setSlotStatus(LEVEL.roles.map(() => null));
    setScore(0);
  }

  function autoFill() {
    const preset = LEVEL.roles.map((role) =>
      speciesList.find((sp) => sp.role === role) || null
    );
    setSlots(preset);
    setSlotStatus(preset.map((sp) => (sp ? "correct" : null)));
    setScore(50 + level * 10);
    triggerConfetti(); // 🎉 for autofill
  }

  function nextLevel() {
    setLevel((l) => Math.min(10, l + 1));
    resetLevel();
  }

  // 🔙 Back navigation to biology lab
  useEffect(() => {
    const handleBack = (e) => {
      e.preventDefault();
      window.history.pushState(null, "", "/games/lab/biology");
      window.location.replace("/games/lab/biology");
    };

    window.handleLabBack = () => {
      window.location.replace("/games/lab/biology");
    };

    // intercept browser back
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
      delete window.handleLabBack;
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: "50px 0 0 0",
        overflow: "auto",
        padding: 28,
        color: "#fff",
        background: "linear-gradient(180deg,#071129 0%, #0b1220 100%)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: 40,
          fontWeight: 900,
          marginBottom: 12,
          color: "#fff",
        }}
      >
        Food Chain Builder —{" "}
        {ecosystem.charAt(0).toUpperCase() + ecosystem.slice(1)}
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.75)",
          marginBottom: 20,
        }}
      >
        Build a correct food chain by placing the right species into each slot. Tap
        a species (left) then a slot (center) to place it.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 320px",
          gap: 22,
          maxWidth: 1300,
          margin: "0 auto",
        }}
      >
        {/* LEFT: Ecosystem + Palette */}
        <aside
          style={{
            padding: 16,
            borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {Object.keys(SPECIES_DB).map((eco) => (
              <button
                key={eco}
                onClick={() => {
                  setEcosystem(eco);
                  resetLevel();
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    ecosystem === eco
                      ? "linear-gradient(90deg,#16a34a,#059669)"
                      : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {eco}
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: 6, marginBottom: 12, color: "#fff" }}>
            Species Palette
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 520,
              overflow: "auto",
              paddingRight: 6,
            }}
          >
            {speciesList.map((sp) => (
              <Tile
                key={sp.id}
                species={sp}
                selected={selectedSpecies?.id === sp.id}
                onClick={setSelectedSpecies}
              />
            ))}
          </div>
        </aside>

        {/* CENTER: Slots */}
        <main style={{ padding: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${LEVEL.roles.length}, 1fr)`,
              gap: 16,
            }}
          >
            {LEVEL.roles.map((role, i) => (
              <Slot
                key={i}
                needRole={role}
                placed={slots[i]}
                status={slotStatus[i]}
                onTap={() => handleSlotTap(i)}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.8)" }}>
              <div>
                Placed: {slots.filter(Boolean).length} / {LEVEL.roles.length}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Tip: A healthy food chain starts with producers (plants) — they
                provide energy for the rest.
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 10,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(slots.filter(Boolean).length / LEVEL.roles.length) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg,#22c55e,#16a34a)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={nextLevel}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                + Level
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT: Inspector */}
        <aside
          style={{
            padding: 16,
            borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <h3 style={{ color: "#fff" }}>Inspector</h3>
          {selectedSpecies ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 40 }}>{selectedSpecies.icon}</div>
              <div>
                <div style={{ fontWeight: 900, color: "#fff" }}>
                  {selectedSpecies.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)" }}>
                  {selectedSpecies.desc}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  Role: {selectedSpecies.role}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.7)" }}>
              Select a species to see details here.
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 8, color: "#fff" }}>Level & Score</h4>
            <div style={{ marginBottom: 8 }}>
              Level: <b>{level}</b>
            </div>
            <div style={{ marginBottom: 8 }}>
              Score: <b>{score}</b>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={resetLevel}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
              <button
                onClick={autoFill}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#10b981",
                  color: "#000",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Auto Fill
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ color: "#fff" }}>Learning Notes</h4>
            <ul style={{ color: "rgba(255,255,255,0.78)" }}>
              <li>Producers make food using sunlight.</li>
              <li>Primary consumers eat producers (herbivores).</li>
              <li>Secondary consumers prey on primary consumers.</li>
              <li>Tertiary consumers are apex predators.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}