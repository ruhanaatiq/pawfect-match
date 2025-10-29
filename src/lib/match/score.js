// src/lib/match/score.js

/* ----------------------------------------------
   Matching utilities (robust, explainable, tunable)
   - Works with both legacy pet fields and `traits`
   - Missing fields never hard-exclude a pet
   - Exposes: scorePetAgainstUser, normalizePrefs, isBusyBee
------------------------------------------------ */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const near = (a, b) =>
  typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= 1;
const toBool = (v) => v === true || v === "true" || v === 1 || v === "1";

/** Convert UI/localStorage prefs (various keys) → normalized shape */
export function normalizePrefs(p = {}) {
  return {
    // species is handled in the API query; we keep it here for Busy Bee checks
    species: String(p.speciesPref ?? p.species ?? "any").toLowerCase(),
    homeType: String(p.homeType ?? "apartment").toLowerCase(), // "apartment" | "house"

    // 1..5 sliders (default 3 = neutral)
    energyLevel: Number(p.energyLevel ?? 3),
    sociability: Number(p.sociability ?? 3),
    vocalityTolerance: Number(p.vocalityTolerance ?? 3),
    trainingComfort: Number(p.trainingComfort ?? 3),
    homeAloneHours: Number(p.homeAloneHours ?? 3),

    // booleans
    indoorPreferred: toBool(p.indoorPreferred),
    hasKids: toBool(p.hasKids),
    hasOtherPets: toBool(p.hasOtherPets),
  };
}

/** Human-friendly reasons from trait alignment (up to 3) */
function reasonsFor(t, P) {
  const r = [];
  if (near(t.energyLevel, P.energyLevel)) r.push("Energy matches your activity level");
  if (near(t.sociability, P.sociability)) r.push("Great with your desired sociability");
  if (near(t.noiseTolerance, P.vocalityTolerance)) r.push("Okay with your noise tolerance");
  if (near(t.trainingComfort, P.trainingComfort)) r.push("Trainability fits what you want");
  if (near(t.aloneHoursOk, P.homeAloneHours)) r.push("Can stay alone the hours you prefer");
  if (P.indoorPreferred && t.indoorOnly) r.push("Indoor lifestyle match");
  if (P.homeType === "apartment" && t.apartmentFriendly === true) r.push("Apartment-friendly");
  return r.slice(0, 3);
}

/** Five-point distance → similarity (1..0) */
function fivePointSimilarity(petVal, userVal) {
  const a = Number(petVal ?? 3);
  const b = Number(userVal ?? 3);
  const d = Math.abs(a - b);     // 0..4
  return 1 - d / 4;              // 1..0
}

/** Normalize a pet doc into the trait space the scorer understands */
function normalizePetTraits(pet) {
  const t = pet?.traits ?? {};
  const inferredIndoor = /indoor/i.test(
    `${pet?.temperament ?? ""} ${pet?.longDescription ?? ""}`
  );

  return {
    // 1..5 sliders
    energyLevel: t.energyLevel ?? pet?.energyLevel,
    sociability: t.sociability ?? pet?.sociability,
    // UI slider vocalityTolerance → data noiseTolerance (or legacy vocality)
    noiseTolerance: t.noiseTolerance ?? pet?.vocality,
    // UI trainingComfort → data trainingComfort (or legacy trainability)
    trainingComfort: t.trainingComfort ?? pet?.trainability,
    // UI homeAloneHours → data aloneHoursOk (or legacy independence)
    aloneHoursOk: t.aloneHoursOk ?? pet?.independence,

    // booleans (prefer explicit truthy, otherwise infer)
    indoorOnly: (t.indoorPreferred ?? pet?.indoorOnly ?? inferredIndoor) === true,
    apartmentFriendly: t.apartmentFriendly ?? pet?.apartmentFriendly,
    kidFriendly: t.kidFriendly ?? pet?.goodWithKids,
    otherPetsFriendly: t.otherPetsFriendly ?? pet?.goodWithPets,

    // secondary/context for tie-breaks if you need later
    size: String(pet?.size ?? "medium").toLowerCase(), // small|medium|large
  };
}

/**
 * Score a single pet against user prefs.
 * Returns { score (0..100), reasons: string[] }
 * - Uses weighted, explainable components
 * - Missing fields default neutrally; never hard-fail
 */
export function scorePetAgainstUser(pet, rawPrefs = {}) {
  const P = normalizePrefs(rawPrefs);
  const T = normalizePetTraits(pet);

  // ---- Tunable weights (sum ~= 1.0) ----
  const W = {
    energy: 0.18,
    sociability: 0.12,
    vocality: 0.06,
    trainability: 0.10,
    independence: 0.10,
    home: 0.14,
    kids: 0.12,
    otherPets: 0.10,
    indoor: 0.08,
  };

  let s = 0;

  // Sliders (range-based similarity)
  s += fivePointSimilarity(T.energyLevel, P.energyLevel) * W.energy;
  s += fivePointSimilarity(T.sociability, P.sociability) * W.sociability;
  s += fivePointSimilarity(T.noiseTolerance, P.vocalityTolerance) * W.vocality;
  s += fivePointSimilarity(T.trainingComfort, P.trainingComfort) * W.trainability;
  s += fivePointSimilarity(T.aloneHoursOk, P.homeAloneHours) * W.independence;

  // Home fit (apartment vs size), plus explicit apartmentFriendly bonus
  const size = T.size; // small|medium|large
  let homeFit = 0.5;
  if (P.homeType === "apartment") {
    homeFit = size === "small" ? 1 : size === "medium" ? 0.75 : 0.4;
    if (T.apartmentFriendly === true) homeFit = Math.max(homeFit, 0.95);
  } else if (P.homeType === "house") {
    homeFit = size === "large" ? 1 : size === "medium" ? 0.85 : 0.7;
  }
  s += homeFit * W.home;

  // Kids
  const kidsFit = P.hasKids ? (T.kidFriendly === true ? 1 : 0.2) : 0.8;
  s += kidsFit * W.kids;

  // Other pets
  const petsFit = P.hasOtherPets ? (T.otherPetsFriendly === true ? 1 : 0.2) : 0.8;
  s += petsFit * W.otherPets;

  // Indoor preference
  const indoorFit = P.indoorPreferred ? (T.indoorOnly ? 1 : 0.5) : 0.8;
  s += indoorFit * W.indoor;

  // Normalize to 0..100; soft floor/ceiling to keep UI pleasant
  const score = clamp(Math.round(s * 100), 5, 98);

  return {
    score,
    reasons: reasonsFor({ ...T }, P),
  };
}

/** Preset detector: Busy Bee (used by API for graceful fallback logic) */
export function isBusyBee(rawPrefs = {}) {
  const P = normalizePrefs(rawPrefs);
  return P.homeType === "apartment" && P.indoorPreferred === true && P.energyLevel <= 2;
}
