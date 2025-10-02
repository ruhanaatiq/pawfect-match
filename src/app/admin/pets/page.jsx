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
        <Link href="/admin/pets/new" className="rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-700">
          + Add Pet
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          {["all","available","pending","adopted","inactive"].map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1 rounded-full border ${status===s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white hover:bg-emerald-50"}`}
            >
              {s[0].toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input input-sm input-bordered w-64"
            placeholder="Search name, breed, species…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            onKeyDown={(e)=>{ if (e.key==="Enter"){ setPage(1); load(); } }}
          />
          <button className="btn btn-sm" onClick={()=>{ setPage(1); load(); }}>Search</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow bg-white">
        {/* Keep comments OUTSIDE colgroup to avoid hydration issues */}
        <table className="table w-full min-w-[1000px] table-zebra">
          <colgroup>
            <col className="w-56" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-40" />
          </colgroup>
          <thead className="bg-emerald-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Pet</th>
              <th className="px-4 py-3">Breed</th>
              <th className="px-4 py-3">Species</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const pid = getId(p);
              return (
                <tr key={pid || `row-${i}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.gender ?? "Unknown"}</div>
                  </td>
                  <td className="px-4 py-3">{p.breed || "—"}</td>
                  <td className="px-4 py-3">{p.species || "—"}</td>
                  <td className="px-4 py-3">{p.age ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="badge">{p.status || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/admin/pets/${pid}/edit`} className="btn btn-xs">Edit</Link>
                    <button className="btn btn-xs btn-error" onClick={()=>deleteOne(pid)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  {loading ? "Loading…" : "No pets found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span className="text-sm">Page {page} / {pages}</span>
        <button className="btn btn-sm" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  );
}
