"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function AdminPetsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const getId = (p) => String(p?.id ?? p?._id ?? "");
  const getThumb = (p) =>
    p?.image || (Array.isArray(p?.images) && p.images[0]) || "/placeholder-pet.jpg";

  const statusBadgeClass = (s) => {
    const key = String(s || "").toLowerCase();
    if (key === "available") return "badge-success";
    if (key === "pending") return "badge-warning";
    if (key === "adopted") return "badge-info";
    if (key === "inactive") return "badge-ghost";
    return "badge-ghost";
  };

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/pets?${params.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!res.ok) return;
    const json = await res.json();
    setRows(json.items || []);
    setTotal(json.total || 0);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function deleteOne(id) {
    if (!id) return alert("Missing pet id");
    if (!confirm("Delete this pet?")) return;
    const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("Failed to delete");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#4C3D3D]">Manage Pets</h2>
        <Link
          href="/admin/pets/new"
          className="rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-700"
        >
          + Add Pet
        </Link>
      </div>

      {/* filters/search */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          {["all","available","pending","adopted","inactive"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`btn btn-sm ${status===s ? "btn-success text-white" : "btn-ghost"}`}
            >
              {s[0].toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <div className="join">
          <input
            className="input input-sm input-bordered join-item w-64"
            placeholder="Search name, breed, species…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            onKeyDown={(e)=>{ if (e.key==="Enter"){ setPage(1); load(); } }}
          />
          <button className="btn btn-sm join-item" onClick={()=>{ setPage(1); load(); }}>
            Search
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto rounded-2xl shadow ring-1 ring-black/5 bg-white">
        <table className="table table-sm w-full min-w-[1000px]">
          {/* no comments inside colgroup (hydration safe) */}
          <colgroup>
            <col className="w-[320px]" />
            <col className="w-[200px]" />
            <col className="w-[140px]" />
            <col className="w-[120px]" />
            <col className="w-[140px]" />
            <col className="w-[160px]" />
          </colgroup>

          <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-900">
            <tr className="text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">Pet</th>
              <th className="px-4 py-3 font-semibold">Breed</th>
              <th className="px-4 py-3 font-semibold">Species</th>
              <th className="px-4 py-3 font-semibold">Age</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="[&>tr:not(:last-child)]:border-b [&>tr]:border-base-200">
            {/* loading skeleton */}
            {loading && !rows.length
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="skeleton h-10 w-10 rounded-xl" />
                        <div className="space-y-1">
                          <div className="skeleton h-4 w-32" />
                          <div className="skeleton h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="skeleton h-4 w-24" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-4 w-10" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-4 text-right"><div className="skeleton h-8 w-24 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              : null}

            {/* data rows */}
            {rows.map((p, i) => {
              const pid = getId(p);
              return (
                <tr
                  key={pid || `row-${i}`}
                  className="hover:bg-emerald-50/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-10 h-10 ring-1 ring-black/5">
                          <img src={getThumb(p)} alt={p.name || "Pet"} loading="lazy" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {(p.gender ?? "Unknown")} • {(p.size || "—")}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">{p.breed || "—"}</td>

                  <td className="px-4 py-3">
                    <span className="badge badge-ghost">{p.species || "—"}</span>
                  </td>

                  <td className="px-4 py-3">{p.age ?? "—"}</td>

                  <td className="px-4 py-3">
                    <span className={`badge ${statusBadgeClass(p.status)}`}>
                      {p.status || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right space-x-1">
                    <Link
                      href={`/admin/pets/${pid}/edit`}
                      className="btn btn-ghost btn-xs"
                      title="Edit"
                    >
                      {/* pencil icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" fill="currentColor"/>
                        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 1 0-1.41 1.41l2.34 2.34a1 1 0 0 0 1.41 0Z" fill="currentColor"/>
                      </svg>
                      Edit
                    </Link>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => deleteOne(pid)}
                      title="Delete"
                    >
                      {/* trash icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Z" fill="currentColor"/>
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && !rows.length && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No pets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span className="badge badge-ghost">{`Page ${page} of ${pages}`}</span>
        <button className="btn btn-sm" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  );
}
