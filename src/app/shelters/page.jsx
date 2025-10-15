// src/app/shelters/page.jsx
export const revalidate = 60; // cache at the edge

import Link from "next/link";
import { absoluteUrl } from "@/lib/absolute-url";

function buildQS(obj) {
  const u = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") u.set(k, String(v));
  });
  return u.toString();
}

async function getShelters({ q = "", page = 1 } = {}) {
  const qs = buildQS({ q, page });
  const url = absoluteUrl(`/api/public/shelters?${qs}`); // 👈 absolute URL
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return { items: [], total: 0, page, pageSize: 20 };
  return res.json();
}

export default async function SheltersPage({ searchParams }) {
  const q = (searchParams?.q || "").toString();
  const page = Math.max(1, Number(searchParams?.page || 1) || 1);

  const { items = [], total = 0, pageSize = 20 } = await getShelters({ q, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#4C3D3D]">Shelters</h1>
      </div>

      {/* Search */}
      <form action="/shelters" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, city, state…"
          className="flex-1 rounded-xl border px-3 py-2"
        />
        <button className="rounded-xl border px-3 py-2 hover:bg-emerald-50">
          Search
        </button>
      </form>

      {/* Grid */}
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((s) => {
            const id = s._id || s.id;
            const loc = s.location || {};
            const locLine =
              [loc.city, loc.state, loc.country].filter(Boolean).join(", ") || "—";
            const href = s.publicSlug ? `/shelters/${s.publicSlug}` : `/shelters/${id}`;
            return (
              <li key={String(id)}>
                <Link
                  href={href}
                  className="block rounded-xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4 hover:shadow-md"
                >
                  <div className="font-semibold text-[#4C3D3D]">{s.name}</div>
                  <div className="text-sm text-gray-600">{locLine}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 py-12 text-center text-gray-500">
          No shelters yet
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/shelters?${buildQS({ q, page: Math.max(1, page - 1) })}`}
            className={`rounded border px-3 py-1 ${
              page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"
            }`}
          >
            Prev
          </Link>
          <Link
            href={`/shelters?${buildQS({ q, page: Math.min(totalPages, page + 1) })}`}
            className={`rounded border px-3 py-1 ${
              page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
