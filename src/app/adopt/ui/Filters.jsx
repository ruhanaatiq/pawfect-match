"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const groups = [
  { key: "species", label: "Species", options: ["dog", "cat", "rabbit", "bird", "other"] },
  { key: "age", label: "Age", options: ["Puppy/Kitten", "Young", "Adult", "Senior"] },
  { key: "size", label: "Size", options: ["Small", "Medium", "Large"] },
  { key: "gender", label: "Gender", options: ["Male", "Female"] },
];

export default function Filters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") || "");
  const [loc, setLoc] = useState(sp.get("loc") || "");
  const [radius, setRadius] = useState(sp.get("radius") || "25");

  useEffect(() => setQ(sp.get("q") || ""), [sp]);

  function applyParam(key, value) {
    const next = new URLSearchParams(sp.toString());
    if (!value) next.delete(key); else next.set(key, value);
    next.set("page", "1");
    router.push(`/adopt?${next.toString()}`);
  }

  function clearAll() {
    router.push("/adopt");
  }

  const get = (k) => sp.get(k) || "";

  const activeChips = useMemo(() => {
    const keys = ["species","age","size","gender","radius","loc","q","good","vax","spay"];
    return keys.map(k => [k, sp.get(k)]).filter(([,v]) => v && v !== "");
  }, [sp]);

  return (
    <section
      className="
        md:sticky md:top-[72px] md:z-40   /* below navbar, above cards */
        rounded-2xl bg-white/90 backdrop-blur border border-black/5 shadow-sm
        p-3 md:p-4
      "
      aria-label="Filters"
    >
      {/* ROW — label on top, control below; arranged horizontally with wrap */}
      <div className="flex flex-wrap items-end gap-3">

        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[#4C3D3D]/70">Search</label>
          <div className="flex">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyParam("q", q)}
              placeholder="Name, breed..."
              className="h-9 w-[220px] rounded-l-md border border-black/10 bg-white px-3 text-sm outline-none"
            />
            <button
              onClick={() => applyParam("q", q)}
              className="h-9 rounded-r-md bg-emerald-600 px-3 text-sm text-white"
            >
              Go
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[#4C3D3D]/70">Location</label>
          <input
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            onBlur={() => applyParam("loc", loc)}
            placeholder="City or ZIP"
            className="h-9 w-[200px] rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
          />
        </div>

        {/* Radius */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[#4C3D3D]/70">Radius</label>
          <select
            value={radius}
            onChange={(e) => { setRadius(e.target.value); applyParam("radius", e.target.value); }}
            className="h-9 min-w-[110px] rounded-md border border-black/10 bg-white px-2 text-sm"
          >
            {[10,25,50,100].map(r => <option key={r} value={r}>{r} km</option>)}
          </select>
        </div>

        {/* Core selects: Species, Age, Size, Gender */}
        {groups.map((g) => (
          <div key={g.key} className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#4C3D3D]/70">{g.label}</label>
            <select
              value={get(g.key)}
              onChange={(e) => applyParam(g.key, e.target.value)}
              className="h-9 min-w-[150px] rounded-md border border-black/10 bg-white px-2 text-sm"
            >
              <option value="">Any</option>
              {g.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}

        {/* Preferences toggles */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[#4C3D3D]/70">Preferences</label>
          <div className="flex flex-wrap gap-2">
            {[
              ["good","Good w/ kids"],
              ["vax","Vaccinated"],
              ["spay","Spayed/Neutered"],
            ].map(([k, label]) => {
              const on = !!sp.get(k);
              return (
                <button
                  key={k}
                  onClick={() => applyParam(k, on ? "" : "1")}
                  className={`h-9 rounded-md border px-2 text-xs ${
                    on
                      ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                      : "bg-white border-black/10 text-[#4C3D3D]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear all aligned right */}
        <button
          onClick={clearAll}
          className="ml-auto h-9 rounded-md border border-black/10 bg-white px-3 text-sm text-emerald-700 hover:bg-emerald-50"
        >
          Clear all
        </button>
      </div>

      {/* Active chips below the row */}
      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeChips.map(([k, v]) => (
            <button
              key={`${k}-${v}`}
              onClick={() => applyParam(k, "")}
              className="rounded-full bg-emerald-600/10 text-emerald-700 px-3 py-1 text-xs"
              title={`Remove ${k}`}
            >
              {k}: {v} ×
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
