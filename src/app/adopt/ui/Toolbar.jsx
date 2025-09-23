"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Toolbar({ total }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const sort = sp.get("sort") || "recent";
  const view = sp.get("view") || "grid";

  function update(param, value) {
    const next = new URLSearchParams(sp.toString());
    next.set(param, value);
    next.set("page", "1");
    router.push(`/adopt?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 backdrop-blur border border-black/5 p-3">
      <div className="text-sm text-[#4C3D3D]/80">{total} results</div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-[#4C3D3D]/80">Sort</label>
        <select
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm"
        >
          <option value="recent">Most recent</option>
          <option value="distance">Nearest</option>
          <option value="youngest">Youngest</option>
        </select>

        <div className="ml-2 inline-flex overflow-hidden rounded-md border border-black/10">
          <button
            onClick={() => update("view", "grid")}
            className={`px-3 py-1 text-sm ${view === "grid" ? "bg-emerald-600 text-white" : "bg-white"}`}
          >
            Grid
          </button>
          <button
            onClick={() => update("view", "list")}
            className={`px-3 py-1 text-sm ${view === "list" ? "bg-emerald-600 text-white" : "bg-white"}`}
          >
            List
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="md:hidden rounded-md bg-[#4C3D3D] px-3 py-1.5 text-sm text-white"
        >
          Filters
        </button>
      </div>
    </div>
  );
}
