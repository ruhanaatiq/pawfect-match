"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint,
  Home,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Sparkles,
  SlidersHorizontal,
  BadgePercent,
  RotateCcw,
} from "lucide-react";

/* -------------------------------------------------
   Model + Helpers
-------------------------------------------------- */
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

const sliderDefs = [
  ["energyLevel", "Your Activity / Exercise Level"],
  ["sociability", "How Social Are You?"],
  ["vocalityTolerance", "Okay with Noise? (Barks/Meows)"],
  ["trainingComfort", "Comfort Training a Pet"],
  ["homeAloneHours", "Hours Pet May Be Alone"],
];

function computePersonalization(f) {
  const sKeys = ["energyLevel", "sociability", "vocalityTolerance", "trainingComfort", "homeAloneHours"];
  const sliderScore = sKeys
    .map((k) => Math.abs((Number(f[k]) || 3) - 3) / 2)
    .reduce((a, b) => a + b, 0); // 0..5
  const toggleScore = (f.hasKids ? 0.5 : 0) + (f.hasOtherPets ? 0.5 : 0) + (f.indoorPreferred ? 0.5 : 0); // 0..1.5
  const speciesScore = f.speciesPref && f.speciesPref !== "any" ? 1 : 0; // 0..1
  const homeScore = f.homeType !== "apartment" ? 0.5 : 0; // 0..0.5
  const total = sliderScore + toggleScore + speciesScore + homeScore; // 0..8
  const pct = Math.round((total / 8) * 100);
  let label = "Low";
  if (pct >= 34 && pct < 67) label = "Medium";
  if (pct >= 67) label = "High";
  return { pct, label };
}

/* -------------------------------------------------
   UI Building Blocks
-------------------------------------------------- */
const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

function Ring({ pct }) {
  const angle = Math.min(360, Math.max(0, Math.round((pct / 100) * 360)));
  return (
    <div className="relative size-24 md:size-28" aria-label={`Personalization ${pct}%`}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#10b981 ${angle}deg, #e5e7eb ${angle}deg)` }}
      />
      <div className="absolute inset-[6px] md:inset-[7px] rounded-full bg-white/80 backdrop-blur" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-xl font-extrabold text-emerald-700">{pct}%</div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500">Personalized</div>
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60 ${
        active
          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
          : "bg-white/70 text-gray-700 border-gray-200 hover:border-gray-300"
      }`}
      aria-pressed={active}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl border bg-white/70 backdrop-blur-sm border-gray-200 hover:border-gray-300 transition">
      <div>
        <div className="font-medium text-gray-800">{label}</div>
        {hint ? <div className="text-xs text-gray-500">{hint}</div> : null}
      </div>
      <motion.input
        type="checkbox"
        className="toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        whileTap={{ scale: 0.95 }}
        aria-checked={checked}
      />
    </label>
  );
}

function Toast({ show, children, onHide }) {
  useEffect(() => {
    if (!show) return;
    const id = setTimeout(onHide, 1600);
    return () => clearTimeout(id);
  }, [show, onHide]);
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="rounded-full bg-white/95 shadow-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* -------------------------------------------------
   Page
-------------------------------------------------- */
export default function MatchmakerPage() {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  // hydrate from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pm_prefs") || "null");
      if (saved) setForm((f) => ({ ...f, ...saved }));
    } catch {}
  }, []);

  const onChange = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);
  const { pct, label } = useMemo(() => computePersonalization(form), [form]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      localStorage.setItem("pm_prefs", JSON.stringify(form));
    } catch {}
    router.push(`/matchmaker/results?species=${form.speciesPref}`);
  }

  // --- Reset support ---
  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form]);
  const handleReset = useCallback(() => {
    setForm(initial);
    try {
      localStorage.removeItem("pm_prefs");
    } catch {}
    setShowToast(true);
  }, []);

  // Keyboard shortcut Alt+R -> reset
  useEffect(() => {
    function onKey(e) {
      if (e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        if (isDirty) handleReset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleReset, isDirty]);

  // quick presets
  const presets = [
    {
      name: "Busy Bee",
      hint: "Low time, apartment living",
      data: {
        energyLevel: 2,
        sociability: 3,
        vocalityTolerance: 3,
        trainingComfort: 2,
        homeAloneHours: 4,
        homeType: "apartment",
        hasKids: false,
        hasOtherPets: false,
        indoorPreferred: true,
        speciesPref: "cat",
      },
    },
    {
      name: "Adventure Duo",
      hint: "Active lifestyle, loves training",
      data: {
        energyLevel: 5,
        sociability: 4,
        vocalityTolerance: 4,
        trainingComfort: 5,
        homeAloneHours: 2,
        homeType: "house",
        hasKids: false,
        hasOtherPets: true,
        indoorPreferred: false,
        speciesPref: "dog",
      },
    },
    {
      name: "Calm & Cozy",
      hint: "Quiet home, gentle company",
      data: {
        energyLevel: 2,
        sociability: 2,
        vocalityTolerance: 2,
        trainingComfort: 3,
        homeAloneHours: 3,
        homeType: "apartment",
        hasKids: true,
        hasOtherPets: false,
        indoorPreferred: true,
        speciesPref: "rabbit",
      },
    },
  ];

  return (
    <div className="relative min-h-[100svh]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#ecfdf5,transparent),radial-gradient(40%_40%_at_100%_0%,#d1fae5,transparent)]" />

      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-white/70 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Smart AI Matchmaker
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight text-[#173d33]">
         <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600">Pawfect Match</span>
          </h1>
          <p className="mt-2 text-gray-600">Answer a few delightful prompts—your matches adapt instantly.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Left: Controls */}
          <motion.section
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="rounded-3xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5 md:p-6 space-y-6"
          >
            {/* Personalization bar */}
            <div className="flex items-center justify-between gap-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <BadgePercent className="h-4 w-4" /> Personalization
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-emerald-900 font-semibold">{label} • {pct}%</div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!isDirty}
                  className="px-2 py-1 text-xs rounded-full border border-emerald-200 bg-white/70 text-emerald-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  aria-disabled={!isDirty}
                  title="Reset all answers (Alt+R)"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Species chips */}
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Preferred Species</div>
              <div className="flex flex-wrap gap-2">
                <Chip active={form.speciesPref === "any"} onClick={() => onChange("speciesPref", "any")} icon={PawPrint}>Any</Chip>
                <Chip active={form.speciesPref === "dog"} onClick={() => onChange("speciesPref", "dog")} icon={Dog}>Dog</Chip>
                <Chip active={form.speciesPref === "cat"} onClick={() => onChange("speciesPref", "cat")} icon={Cat}>Cat</Chip>
                <Chip active={form.speciesPref === "rabbit"} onClick={() => onChange("speciesPref", "rabbit")} icon={Rabbit}>Rabbit</Chip>
                <Chip active={form.speciesPref === "bird"} onClick={() => onChange("speciesPref", "bird")} icon={Bird}>Bird</Chip>
              </div>
            </div>

            {/* Home type */}
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Home Type</div>
              <div className="flex flex-wrap gap-2">
                <Chip active={form.homeType === "apartment"} onClick={() => onChange("homeType", "apartment")} icon={Home}>Apartment</Chip>
                <Chip active={form.homeType === "house"} onClick={() => onChange("homeType", "house")} icon={Home}>House</Chip>
              </div>
            </div>

            {/* Sliders */}
            <details className="group rounded-2xl border border-gray-200 bg-white/60 open:bg-white/80 transition">
              <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none select-none">
                <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
                <span className="font-semibold text-gray-800">Fine‑tune Preferences</span>
                <span className="ml-auto text-xs text-gray-500 group-open:hidden">show</span>
                <span className="ml-auto text-xs text-gray-500 hidden group-open:inline">hide</span>
              </summary>
              <div className="px-4 pb-4 space-y-5">
                {sliderDefs.map(([key, lab]) => (
                  <label key={key} className="block">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{lab}</span>
                      <motion.span
                        key={String(form[key])}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 240, damping: 16 }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                        aria-live="polite"
                      >
                        {form[key]}
                      </motion.span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={form[key]}
                      onChange={(e) => onChange(key, Number(e.target.value))}
                      className="range range-primary"
                      aria-label={lab}
                    />
                    <div className="flex justify-between text-[11px] px-1 text-gray-500"><span>1</span><span>5</span></div>
                  </label>
                ))}
              </div>
            </details>

            {/* Toggles */}
            <div className="grid md:grid-cols-3 gap-3">
              <ToggleRow label="Have Kids" hint="Kid‑friendly companions" checked={form.hasKids} onChange={(v) => onChange("hasKids", v)} />
              <ToggleRow label="Have Other Pets" hint="Good with resident pets" checked={form.hasOtherPets} onChange={(v) => onChange("hasOtherPets", v)} />
              <ToggleRow label="Prefer Indoor‑Only" hint="Indoor lifestyle preferred" checked={form.indoorPreferred} onChange={(v) => onChange("indoorPreferred", v)} />
            </div>

            {/* Presets */}
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Try a Quick Preset</div>
              <div className="grid sm:grid-cols-3 gap-3">
                {presets.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => setForm((f) => ({ ...f, ...p.data }))}
                    className="group rounded-2xl border border-gray-200 bg-white/70 hover:bg-white p-3 text-left transition"
                  >
                    <div className="font-semibold text-gray-800 group-hover:text-emerald-700">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Right: Live Summary Card */}
          <motion.aside
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-white/90 to-emerald-50/60 backdrop-blur shadow-sm p-6 sticky top-4"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-white/80 text-emerald-700 text-xs font-semibold">
                <PawPrint className="h-4 w-4" /> Compatibility
              </div>
              <Ring pct={pct} />
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Readiness</span>
                <span className="font-semibold text-emerald-700">{label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Species</span>
                <span className="font-medium capitalize">{form.speciesPref}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Home</span>
                <span className="font-medium capitalize">{form.homeType}</span>
              </div>
              <div className="border-t border-dashed my-3" />
              <ul className="space-y-2 text-gray-700">
                <li>• Activity level: <b>{form.energyLevel}</b></li>
                <li>• Sociability: <b>{form.sociability}</b></li>
                <li>• Noise tolerance: <b>{form.vocalityTolerance}</b></li>
                <li>• Training comfort: <b>{form.trainingComfort}</b></li>
                <li>• Alone hours: <b>{form.homeAloneHours}</b></li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full py-2 btn btn-primary bg-gradient-to-r from-emerald-600 to-teal-500 border-0 text-white font-bold rounded-2xl"
            >
              <span className="mr-2 inline-block animate-[bounce_2s_infinite]">🐾</span>
              {submitting ? "Matching…" : "See My Matches"}
            </button>
            <p className="mt-2 text-[11px] text-center text-gray-500">Your preferences are saved locally and can be changed anytime.</p>
          </motion.aside>
        </form>
      </div>

      {/* Helper & Toast */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="rounded-full bg-white/90 shadow-lg border border-gray-200 px-4 py-2 text-xs text-gray-600">
            Tip: choose a species and tweak sliders for higher personalization. Press <kbd className="px-1 py-0.5 rounded border">Alt+R</kbd> to reset.
          </div>
        </motion.div>
      </AnimatePresence>

      <Toast show={showToast} onHide={() => setShowToast(false)}>Preferences cleared</Toast>
    </div>
  );
}