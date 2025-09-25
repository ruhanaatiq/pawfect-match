"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function PetCard({ pet, view }) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white/80 backdrop-blur shadow-sm overflow-hidden ${
        view === "list" ? "flex" : ""
      }`}
    >
      <div
        className={`${
          view === "list" ? "w-48 h-40" : "h-48"
        } bg-gray-100 overflow-hidden`}
      >
        <img
          src={pet.image}
          alt={pet.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-[#4C3D3D]">{pet.name}</h3>
            <p className="text-sm text-[#4C3D3D]/70">
              {pet.breed} • {pet.age} • {pet.gender}
            </p>
          </div>
          <button
            aria-label="save"
            className="rounded-full bg-white border border-black/10 px-3 py-1 text-xs text-[#4C3D3D] hover:bg-emerald-50"
          >
            ♥
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {pet.tags.map((t, i) => (
            <span
              key={i}
              className="rounded-full bg-emerald-600/10 text-emerald-700 px-2 py-0.5 text-xs"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-[#4C3D3D]/70">{pet.shelter}</span>
          <span className="text-[#4C3D3D]">{pet.distanceKm} km</span>
        </div>

        <div className="mt-3">
         <Link
  href={`/adopt/request/${pet.id}`}
  className="inline-block rounded-md bg-emerald-600 px-3 py-2 text-white text-sm font-semibold hover:bg-emerald-700"
>
  Adopt
</Link>
        </div>
      </div>
    </div>
  );
}

function Pagination({ total, pageSize }) {
  const sp = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(sp.get("page") || "1"));
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // ✅ hooks always run before conditional returns
  const items = useMemo(
    () => Array.from({ length: pages }, (_, i) => i + 1),
    [pages]
  );
  const canPrev = page > 1;
  const canNext = page < pages;

  function go(n) {
    const next = new URLSearchParams(sp.toString());
    next.set("page", String(n));
    router.push(`/adopt?${next.toString()}`);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (pages <= 1) return null;

  return (
    <nav className="mt-6 flex justify-center gap-2">
      <button
        disabled={!canPrev}
        onClick={() => go(page - 1)}
        className="rounded-md border border-black/10 bg-white px-3 py-1 text-sm disabled:opacity-50"
      >
        Prev
      </button>

      {items.map((i) => (
        <button
          key={i}
          onClick={() => go(i)}
          className={`rounded-md px-3 py-1 text-sm border ${
            i === page
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white border-black/10"
          }`}
        >
          {i}
        </button>
      ))}

      <button
        disabled={!canNext}
        onClick={() => go(page + 1)}
        className="rounded-md border border-black/10 bg-white px-3 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}

export default function PetsGrid({ data }) {
  const sp = useSearchParams();
  const view = sp.get("view") || "grid";

  if (!data?.items?.length) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white/80 p-10 text-center text-[#4C3D3D]/70">
        No pets match your filters. Try widening your search.
      </div>
    );
  }

  return (
    <div>
      <div
        className={
          view === "list"
            ? "space-y-4"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {data.items.map((p) => (
          <PetCard key={p.id} pet={p} view={view} />
        ))}
      </div>

      <Pagination total={data.total} pageSize={data.pageSize} />
    </div>
  );
}
