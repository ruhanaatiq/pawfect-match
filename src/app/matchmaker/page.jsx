"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function MatchmakerPage() {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pm_prefs") || "null");
      if (saved) setForm({ ...initial, ...saved });
    } catch {}
  }, []);

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    localStorage.setItem("pm_prefs", JSON.stringify(form));
    // Navigate to results; API will read prefs from query to SSR or we fetch client-side
    router.push(`/matchmaker/results?species=${form.speciesPref}`);
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Find Your Pawfect Match</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* species */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Preferred Species</span>
            <select
              className="select select-bordered"
              value={form.speciesPref}
              onChange={(e) => onChange("speciesPref", e.target.value)}
            >
              <option value="any">Any</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="rabbit">Rabbit</option>
              <option value="bird">Bird</option>
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">Home Type</span>
            <select
              className="select select-bordered"
              value={form.homeType}
              onChange={(e) => onChange("homeType", e.target.value)}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
            </select>
          </label>
        </div>

        {/* sliders */}
        {[
          ["energyLevel", "Your Activity / Exercise Level"],
          ["sociability", "How Social Are You?"],
          ["vocalityTolerance", "Okay with Noise? (Barks/Meows)"],
          ["trainingComfort", "Comfort Training a Pet"],
          ["homeAloneHours", "Hours Pet May Be Alone"],
        ].map(([key, label]) => (
          <label key={key} className="form-control">
            <div className="label"><span className="label-text">{label}</span></div>
            <input
              type="range"
              min="1" max="5" step="1"
              value={form[key]}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className="range"
            />
            <div className="flex justify-between text-xs px-1"><span>1</span><span>5</span></div>
          </label>
        ))}

        {/* toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="label cursor-pointer">
            <span className="label-text">Have Kids</span>
            <input type="checkbox" className="toggle"
              checked={form.hasKids}
              onChange={(e) => onChange("hasKids", e.target.checked)} />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Have Other Pets</span>
            <input type="checkbox" className="toggle"
              checked={form.hasOtherPets}
              onChange={(e) => onChange("hasOtherPets", e.target.checked)} />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">Prefer Indoor-Only</span>
            <input type="checkbox" className="toggle"
              checked={form.indoorPreferred}
              onChange={(e) => onChange("indoorPreferred", e.target.checked)} />
          </label>
        </div>

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Matching..." : "See My Matches"}
        </button>
      </form>
    </div>
  );
}
