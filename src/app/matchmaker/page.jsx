"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const initial = {
  energyLevel: 3,
  sociability: 3,
  vocalityTolerance: 3,
  trainingComfort: 3,
  homeAloneHours: 3,
  homeType: "apartment",
  hasKids: false,
  hasOtherPets: false,
  indoorPreferred: false,
  speciesPref: "any",
};

const container = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, duration: 0.35, ease: "easeOut" },
  },
};
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

/* ---------- Personalization progress ---------- */
function computePersonalization(f) {
  // Sliders: distance from neutral (3). Max per slider = 2 → normalize by 2.
  const sliderKeys = ["energyLevel", "sociability", "vocalityTolerance", "trainingComfort", "homeAloneHours"];
  const sliderScore = sliderKeys
    .map((k) => Math.abs((Number(f[k]) || 3) - 3) / 2) // 0..1
    .reduce((a, b) => a + b, 0); // 0..5

  // Toggles: each checked adds 0.5 (3 toggles → 1.5 max)
  const toggleScore = (f.hasKids ? 0.5 : 0) + (f.hasOtherPets ? 0.5 : 0) + (f.indoorPreferred ? 0.5 : 0); // 0..1.5

  // Species: choosing not "any" adds 1
  const speciesScore = f.speciesPref && f.speciesPref !== "any" ? 1 : 0; // 0..1

  // HomeType: default is "apartment"; if changed to "house" add 0.5
  const homeScore = f.homeType !== "apartment" ? 0.5 : 0; // 0..0.5

  const total = sliderScore + toggleScore + speciesScore + homeScore; // 0..8
  const pct = Math.round((total / 8) * 100);
  let label = "Low";
  if (pct >= 34 && pct < 67) label = "Medium";
  if (pct >= 67) label = "High";
  return { pct, label };
}

export default function MatchmakerPage() {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pm_prefs") || "null");
      if (saved) setForm((f) => ({ ...f, ...saved }));
    } catch {}
  }, []);

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { pct, label } = useMemo(() => computePersonalization(form), [form]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    localStorage.setItem("pm_prefs", JSON.stringify(form));
    router.push(`/matchmaker/results?species=${form.speciesPref}`);
  }

  const sliders = useMemo(
    () => [
      ["energyLevel", "Your Activity / Exercise Level"],
      ["sociability", "How Social Are You?"],
      ["vocalityTolerance", "Okay with Noise? (Barks/Meows)"],
      ["trainingComfort", "Comfort Training a Pet"],
      ["homeAloneHours", "Hours Pet May Be Alone"],
    ],
    []
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center mb-6"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold uppercase tracking-wide">
          <span className="animate-[pulse_2.2s_ease-in-out_infinite]">🧠</span> AI Matchmaker
        </span>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[#4C3D3D]">
          Find Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600">Pawfect Match</span>
        </h1>
        <p className="mt-2 text-gray-600">
          Take a quick quiz (<span className="font-medium">~60s</span>) and we’ll rank pets by compatibility.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.form
        onSubmit={handleSubmit}
        variants={container}
        initial="hidden"
        animate="show"
        className="card bg-base-100 shadow-md border border-gray-100"
      >
        <div className="card-body space-y-6">
          {/* Personalization progress */}
          <motion.div variants={item} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Personalization</span>
              <span className="text-gray-600">{label} • {pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                role="progressbar"
              />
            </div>
            <p className="text-xs text-gray-500">
              Move sliders, choose a species, and toggle preferences to improve match accuracy.
            </p>
          </motion.div>

          {/* selects */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text">Preferred Species :</span>
              <motion.select
                whileTap={{ scale: 0.99 }}
                className="select select-bordered px-2"
                value={form.speciesPref}
                onChange={(e) => onChange("speciesPref", e.target.value)}
              >
                <option value="any">Any</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option>
                <option value="bird">Bird</option>
              </motion.select>
            </label>

            <label className="form-control">
              <span className="label-text">Home Type :</span>
              <motion.select
                whileTap={{ scale: 0.99 }}
                className="select select-bordered px-2"
                value={form.homeType}
                onChange={(e) => onChange("homeType", e.target.value)}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
              </motion.select>
            </label>
          </motion.div>

          {/* sliders */}
          <div className="grid grid-cols-1 gap-5">
            {sliders.map(([key, label]) => (
              <motion.label key={key} variants={item} className="form-control">
                <div className="label justify-between">
                  <span className="label-text">{label}</span>
                  <motion.span
                    key={form[key]}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    aria-live="polite"
                  >
                    {form[key]}
                  </motion.span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={form[key]}
                  onChange={(e) => onChange(key, Number(e.target.value))}
                  className="range range-primary"
                  aria-label={label}
                />
                <div className="flex justify-between text-[11px] px-1 text-gray-500">
                  <span>1</span><span>5</span>
                </div>
              </motion.label>
            ))}
          </div>

          {/* toggles */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
            <Toggle
              label="Have Kids"
              checked={form.hasKids}
              onChange={(v) => onChange("hasKids", v)}
            />
            <Toggle
              label="Have Other Pets"
              checked={form.hasOtherPets}
              onChange={(v) => onChange("hasOtherPets", v)}
            />
            <Toggle
              label="Prefer Indoor-Only"
              checked={form.indoorPreferred}
              onChange={(v) => onChange("indoorPreferred", v)}
            />
          </motion.div>

          {/* submit */}
          <motion.div variants={item} className="pt-2">
            <motion.button
              type="submit"
              className="btn btn-primary rounded-4xl px-3 py-2 btn-block md:btn-lg text-white font-bold bg-gradient-to-r from-emerald-600 to-teal-500 border-0"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
            >
              <motion.span
                className="mr-2"
                animate={
                  submitting
                    ? { rotate: [0, 360], transition: { repeat: Infinity, duration: 0.9, ease: "linear" } }
                    : { rotate: [0, -12, 12, 0], y: [0, -1, 1, 0], transition: { duration: 1.2, repeat: Infinity, repeatDelay: 1.3 } }
                }
                aria-hidden
              >
                🐾
              </motion.span>
              {submitting ? "Matching..." : "See My Matches"}
            </motion.button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              We’ll use your answers locally to personalize results. You can update them anytime.
            </p>
          </motion.div>
        </div>
      </motion.form>
    </div>
  );
}

/* ---------- tiny toggle with micro-interactions ---------- */
function Toggle({ label, checked, onChange }) {
  return (
    <label className="label cursor-pointer items-center justify-between px-3 py-2 rounded-xl border border-gray-200 bg-white/70 hover:bg-white shadow-sm transition">
      <span className="label-text">{label}</span>
      <motion.input
        type="checkbox"
        className="toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        whileTap={{ scale: 0.95 }}
      />
    </label>
  );
}
