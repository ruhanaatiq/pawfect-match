// A simple, explainable scorer (0..100). You can tune weights later.
export function scorePetAgainstUser(pet, prefs) {
  const reasons = [];

  // weights sum ~ 1.0
  const W = {
    energy: 0.18,
    sociability: 0.12,
    vocality: 0.06,
    trainability: 0.10,
    independence: 0.10,
    home: 0.14,
    kids: 0.12,
    otherPets: 0.10,
    indoor: 0.08
  };

  // helper for 1..5 distances
  const fivePoint = (petVal, userVal) => {
    const d = Math.abs(Number(petVal || 3) - Number(userVal || 3)); // 0..4
    return 1 - d / 4; // 1..0
  };

  let s = 0;

  const e = fivePoint(pet.energyLevel, prefs.energyLevel);
  s += e * W.energy;
  if (e > 0.8) reasons.push("Energy matches your activity level");

  const soc = fivePoint(pet.sociability, prefs.sociability);
  s += soc * W.sociability;
  if (soc > 0.8) reasons.push("Great with your desired sociability");

  const voc = fivePoint(pet.vocality, prefs.vocalityTolerance);
  s += voc * W.vocality;

  const tr = fivePoint(pet.trainability, prefs.trainingComfort);
  s += tr * W.trainability;
  if (tr > 0.8) reasons.push("Trainability fits what you want");

  const indep = fivePoint(pet.independence, prefs.homeAloneHours);
  s += indep * W.independence;

  // Home type vs size/indoor
  let homeFit = 0.5;
  const home = String(prefs.homeType || "apartment");
  const size = String(pet.size || "medium");
  if (home === "apartment") homeFit = (size === "small" ? 1 : size === "medium" ? 0.75 : 0.4);
  if (home === "house") homeFit = (size === "large" ? 1 : size === "medium" ? 0.85 : 0.7);
  s += homeFit * W.home;
  if (homeFit > 0.8) reasons.push(`Good fit for your ${home}`);

  // Kids
  const kidsFit = prefs.hasKids ? (pet.goodWithKids ? 1 : 0.2) : 0.8;
  s += kidsFit * W.kids;
  if (prefs.hasKids && pet.goodWithKids) reasons.push("Good with kids");

  // Other pets
  const petsFit = prefs.hasOtherPets ? (pet.goodWithPets ? 1 : 0.2) : 0.8;
  s += petsFit * W.otherPets;
  if (prefs.hasOtherPets && pet.goodWithPets) reasons.push("Friendly with other pets");

  // Indoor
  const indoorFit = prefs.indoorPreferred ? (pet.indoorOnly ? 1 : 0.5) : 0.8;
  s += indoorFit * W.indoor;
  if (prefs.indoorPreferred && pet.indoorOnly) reasons.push("Indoor lifestyle match");

  // normalize to 0..100
  const score = Math.round(s * 100);
  return {
    score,
    reasons: reasons.slice(0, 3), // top-3 reasons
  };
}
