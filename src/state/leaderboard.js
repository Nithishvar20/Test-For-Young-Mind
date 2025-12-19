// src/state/leaderboard.js
const STORAGE_KEY = "quiz_leaderboard";
export const MAX_ENTRIES = 100;

/** Safe parse */
function safeParse(raw) {
  try { return JSON.parse(raw); } catch (e) { console.warn("leaderboard: parse error", e); return null; }
}

/** Read leaderboard */
export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeParse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn("leaderboard: getLeaderboard error", e);
    return [];
  }
}

/** Save full leaderboard */
function saveFullLeaderboard(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr || []));
  } catch (e) {
    console.warn("leaderboard: save error", e);
  }
}

/** Normalize entry */
function normalizeEntry(raw = {}) {
  const e = {
    name: raw.name ? String(raw.name) : "Anonymous",
    school: raw.school ? String(raw.school) : "",
    place: raw.place ? String(raw.place) : "",
    score: Number.isFinite(Number(raw.score)) ? Number(raw.score) : 0,
    date: raw.date ? String(raw.date) : new Date().toISOString()
  };
  if (isNaN(new Date(e.date).getTime())) e.date = new Date().toISOString();
  return e;
}

/**
 * Returns true if two entries are identical across key fields.
 * We compare name, school, place, score and date (exact match).
 */
function entriesEqual(a, b) {
  if (!a || !b) return false;
  return (String(a.name) === String(b.name))
      && (String(a.school) === String(b.school))
      && (String(a.place) === String(b.place))
      && (Number(a.score) === Number(b.score))
      && (String(a.date) === String(b.date));
}

/**
 * Add a single score entry.
 *
 * Prevents immediate duplicates: if the top-most entry already equals the
 * new normalized entry (same name, school, place, score, date) we skip storing.
 */
export function addScoreEntry(entry) {
  try {
    const normalized = normalizeEntry(entry);
    const current = getLeaderboard();

    // If the newest existing entry is identical to the new one, skip.
    // This avoids double-saves when the save function runs twice in quick succession.
    if (current.length > 0 && entriesEqual(current[0], normalized)) {
      // return current unchanged
      return current;
    }

    current.push(normalized);

    // sort by score desc, then date desc (newest first)
    current.sort((a, b) => {
      const scoreDiff = Number(b.score) - Number(a.score);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.date) - new Date(a.date);
    });

    const trimmed = current.slice(0, MAX_ENTRIES);
    saveFullLeaderboard(trimmed);

    // return new leaderboard
    return trimmed;
  } catch (e) {
    console.warn("leaderboard: addScoreEntry error", e);
    return getLeaderboard();
  }
}

/** Clear leaderboard */
export function clearLeaderboard() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("leaderboard: clear error", e);
  }
}

/**
 * dedupeLeaderboard: removes duplicate exact entries (keeps first occurrence)
 * Useful to run once after deploying the fix to clean up historical duplicates.
 */
export function dedupeLeaderboard() {
  try {
    const arr = getLeaderboard();
    const seen = new Set();
    const out = [];
    for (const e of arr) {
      // create a stable key of relevant fields
      const key = `${e.name}||${e.school}||${e.place}||${Number(e.score)}||${e.date}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(e);
    }
    saveFullLeaderboard(out);
    return out;
  } catch (e) {
    console.warn("leaderboard: dedupe error", e);
    return getLeaderboard();
  }
}

/**
 * setLeaderboard: overwrite storage (normalized and trimmed)
 */
export function setLeaderboard(entries = []) {
  if (!Array.isArray(entries)) throw new Error("setLeaderboard expects an array");
  const normalized = entries.map(normalizeEntry)
    .sort((a, b) => {
      const sd = Number(b.score) - Number(a.score);
      if (sd !== 0) return sd;
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, MAX_ENTRIES);
  saveFullLeaderboard(normalized);
  return normalized;
}