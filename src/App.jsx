// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { useLang } from "./state/LangContext";
import { AuthProvider } from "./state/AuthContext";
import { ThemeProvider } from "./state/ThemeContext"; // <- added

import TopBar from "./components/TopBar";
import Particles from "./components/Particles";
import Confetti from "./components/Confetti";
import ChooseMode from "./pages/ChooseMode"; // <-- import ChooseMode
import Front from "./pages/Front";
import Assessment from "./pages/Assessment";
import QuizDifficulty from "./pages/QuizDifficulty";
import GradeList from "./pages/GradeList";
import Subjects from "./pages/Subjects";
import ScienceDrill from "./pages/ScienceDrill";
import StreamSelect from "./pages/StreamSelect";
import LevelSelect from "./pages/LevelSelect";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import WordSearch from "./pages/WordSearch";

// Games (page components)
import Games from "./pages/Games";
import TicTacToe from "./pages/games/TicTacToe";
import ArithmeticA from "./pages/games/arithmetica";
import VisualMemory from "./pages/games/visualmemory";
import LabGames from "./pages/LabGames";

// New game pages you added
import PuzzleQuest from "./pages/games/puzzlequest";
import ChessGame from "./pages/games/chess";
import RiddlesGame from "./pages/games/RiddlesGame"; // <-- added riddles import

// Auth / misc
import Login from "./pages/Login";
import Leaderboard from "./pages/Leaderboard";
import PrivateRoute from "./components/PrivateRoute";

/**
 * Lazy-load experiment components.
 * Keep these as lazy to avoid bundling heavy sims into the main chunk.
 *
 * Expected file locations (update if you renamed):
 *  - src/components/physics/PendulumPro.jsx
 *  - src/components/physics/SpringMass.jsx
 *  - src/components/physics/CircuitLab.jsx
 *
 *  - src/components/chemistry/Titration.jsx
 *  - src/components/chemistry/ReactionKinetics.jsx
 *  - src/components/chemistry/Electrochemistry.jsx
 *
 *  - src/components/biology/CellExplorer.jsx
 *  - src/components/biology/EcosystemSim.jsx
 *  - src/components/biology/GeneticsPlay.jsx
 */
const PendulumPro = lazy(() => import("./components/physics/PendulumPro"));
const SpringMass = lazy(() => import("./components/physics/SpringMass"));
const CircuitLab = lazy(() => import("./components/physics/CircuitLab"));

const Titration = lazy(() => import("./components/chemistry/Titration"));
const ReactionKinetics = lazy(() => import("./components/chemistry/ReactionKinetics"));
const Electrochemistry = lazy(() => import("./components/chemistry/Electrochemistry"));

const CellExplorer = lazy(() => import("./components/biology/CellExplorer"));
const EcosystemSim = lazy(() => import("./components/biology/EcosystemSim"));
const GeneticsPlay = lazy(() => import("./components/biology/GeneticsPlay"));

// Small loading fallback while lazy modules load
function LoaderFallback() {
  return (
    <div style={{ padding: 28, color: "#fff" }}>
      <h3>Loading…</h3>
      <p>Please wait while the lab loads.</p>
    </div>
  );
}

export default function App() {
  // ensure language provider side-effects run if available
  useLang?.();

  const location = useLocation();

  // Show TopBar everywhere except on the login page.
  // (You requested the top-bar Back control be the primary back button.)
  const hideTopBar = location.pathname === "/login";

  return (
    <ThemeProvider>
      <div className="app-root" style={{ minHeight: "100vh", position: "relative" }}>
        <Particles />
        <Confetti />

        <AuthProvider>
          {!hideTopBar && <TopBar />}

          <main style={{ marginTop: hideTopBar ? 0 : 24 }}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/assessment/quiz" element={<QuizDifficulty />} />

              {/* Lab hub routes (hub view) */}
              <Route path="/games/lab" element={<LabGames />} />
              <Route path="/games/lab/:labId" element={<LabGames />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Front />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessment"
                element={
                  <PrivateRoute>
                    <Assessment />
                  </PrivateRoute>
                }
              />

              {/* Important: Add a plain /grades route so nav("/grades") works,
                  and keep the param route for difficulty-specific navigation */}
              <Route
                path="/grades"
                element={
                  <PrivateRoute>
                    <GradeList />
                  </PrivateRoute>
                }
              />
              <Route
                 path="/choose"
                 element={
                   <PrivateRoute>
                     <ChooseMode />
                   </PrivateRoute>
                 }
               />
              <Route
                path="/grades/:difficulty"
                element={
                  <PrivateRoute>
                    <GradeList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/subjects/:difficulty/:grade"
                element={
                  <PrivateRoute>
                    <Subjects />
                  </PrivateRoute>
                }
              />
              <Route
                path="/science-drill/:difficulty/:grade"
                element={
                  <PrivateRoute>
                    <ScienceDrill />
                  </PrivateRoute>
                }
              />
              <Route
                path="/stream/:difficulty/:grade"
                element={
                  <PrivateRoute>
                    <StreamSelect />
                  </PrivateRoute>
                }
              />
              <Route
                path="/level/:difficulty/:grade/:subject"
                element={
                  <PrivateRoute>
                    <LevelSelect />
                  </PrivateRoute>
                }
              />
              <Route
                path="/quiz/:difficulty/:grade/:subject/:level"
                element={
                  <PrivateRoute>
                    <Quiz />
                  </PrivateRoute>
                }
              />
              <Route
                path="/result/:score"
                element={
                  <PrivateRoute>
                    <Result />
                  </PrivateRoute>
                }
              />
              <Route
                path="/wordsearch"
                element={
                  <PrivateRoute>
                    <WordSearch />
                  </PrivateRoute>
                }
              />

              {/* Games */}
              <Route
                path="/games"
                element={
                  <PrivateRoute>
                    <Games />
                  </PrivateRoute>
                }
              />

              <Route
                path="/games/tictactoe"
                element={
                  <PrivateRoute>
                    <TicTacToe />
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/arithmetica"
                element={
                  <PrivateRoute>
                    <ArithmeticA />
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/visualmemory"
                element={
                  <PrivateRoute>
                    <VisualMemory />
                  </PrivateRoute>
                }
              />

              {/* Riddles game route (new) */}
              <Route
                path="/games/riddles"
                element={
                  <PrivateRoute>
                    <RiddlesGame />
                  </PrivateRoute>
                }
              />

              {/* New game routes (added) */}
              <Route
                path="/games/puzzlequest"
                element={
                  <PrivateRoute>
                    <PuzzleQuest />
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/chess"
                element={
                  <PrivateRoute>
                    <ChessGame />
                  </PrivateRoute>
                }
              />

              {/* Physics experiments (protected) */}
              <Route
                path="/games/lab/physics/pendulum"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <PendulumPro />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/lab/physics/spring"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <SpringMass />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/lab/physics/circuit"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <CircuitLab />
                    </Suspense>
                  </PrivateRoute>
                }
              />

              {/* Chemistry experiments (protected) */}
              <Route
                path="/games/lab/chemistry/titration"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <Titration />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/lab/chemistry/kinetics"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <ReactionKinetics />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/lab/chemistry/electro"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <Electrochemistry />
                    </Suspense>
                  </PrivateRoute>
                }
              />

              {/* Biology experiments (protected) */}
              <Route
                path="/games/lab/biology/cell"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <CellExplorer />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/lab/biology/ecosystem"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <EcosystemSim />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/lab/biology/genetics"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoaderFallback />}>
                      <GeneticsPlay />
                    </Suspense>
                  </PrivateRoute>
                }
              />

              {/* Fallback / Not found */}
              <Route
                path="*"
                element={
                  <div style={{ padding: 28, color: "#fff" }}>
                    <h2>404 — Page not found</h2>
                  </div>
                }
              />
            </Routes>
          </main>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}