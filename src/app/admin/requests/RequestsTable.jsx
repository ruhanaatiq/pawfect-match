"use client";

import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

export default function RequestsTable() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  async function loadData() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`/api/admin/requests?${params.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!res.ok) return;
    const json = await res.json();
    setRows(json.items || []);
    setTotal(json.total || 0);
    setSelected(new Set());
  }

  useEffect(() => { loadData(); }, [page, status]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const toggleAll = (checked) => {
    if (checked) setSelected(new Set(rows.map(r => r._id || r.id)));
    else setSelected(new Set());
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  async function updateStatus(ids, newStatus, note) {
    if (!ids.length) return;
    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status: newStatus, note }),
    });
    if (!res.ok) {
      alert("Failed to update");
      return;
    }
    await loadData();
  }

  return (
    <section className="space-y-4">
      {/* Filters/Search */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          {["all","pending","approved","rejected"].map(s => (
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
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            onKeyDown={(e)=>{ if (e.key==="Enter"){ setPage(1); loadData(); } }}
            placeholder="Search adopter, pet, email..."
            className="input input-sm input-bordered w-64"
          />
          <button className="btn btn-sm" onClick={()=>{ setPage(1); loadData(); }}>Search</button>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-2xl shadow bg-white">
        <table className="table w-full min-w-[1000px] table-zebra">
          {/* Define column widths so headers don't collapse */}
          <colgroup>
            <col className="w-10" />          {/* checkbox */}
            <col className="w-48" />         {/* Request */}
            <col className="w-56" />         {/* Pet */}
            <col className="w-64" />         {/* Adopter */}
            <col className="w-28" />         {/* Status */}
            <col className="w-40" />         {/* Requested */}
            <col className="w-56" />         {/* Actions */}
          </colgroup>
          <thead className="bg-emerald-50 sticky top-0 z-10">
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={rows.length>0 && selected.size===rows.length}
                  onChange={(e)=>toggleAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              <th className="whitespace-nowrap px-4 py-3">Request</th>
              <th className="whitespace-nowrap px-4 py-3">Pet</th>
              <th className="whitespace-nowrap px-4 py-3">Adopter</th>
              <th className="whitespace-nowrap px-4 py-3">Status</th>
              <th className="whitespace-nowrap px-4 py-3">Requested</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(r => {
              const id = r._id || r.id;
              return (
                <tr key={id} className="align-middle">
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selected.has(id)}
                      onChange={()=>toggleOne(id)}
                      aria-label={`Select ${id}`}
                    />
                  </td>

                  <td className="text-xs px-4 py-3">
                    <div className="font-medium truncate max-w-[180px]">{id}</div>
                    {r.message ? (
                      <div className="text-gray-500 line-clamp-1">{r.message}</div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium">{r.pet?.name || r.petName || "—"}</div>
                    <div className="text-xs text-gray-500">
                      {(r.pet?.species || r.petSpecies || "")} {r.pet?.breed ? `• ${r.pet.breed}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium">{r.adopter?.name || r.userName || r.applicant?.fullName || "—"}</div>
                    <div className="text-xs text-gray-500">{r.adopter?.email || r.userEmail || r.applicant?.email || ""}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`badge ${r.status==="approved"?"badge-success": r.status==="rejected"?"badge-error":"badge-ghost"}`}
                    >
                      {r.status?.[0]?.toUpperCase() + r.status?.slice(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {new Date(r.createdAt || r.date || Date.now()).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="btn btn-xs" onClick={()=>setModal(r)}>View</button>
                    {r.status!=="approved" && (
                      <button className="btn btn-xs btn-success" onClick={()=>updateStatus([id],"approved")}>Approve</button>
                    )}
                    {r.status!=="rejected" && (
                      <button className="btn btn-xs btn-error" onClick={()=>{
                        const note = prompt("Reason (optional)");
                        updateStatus([id],"rejected",note||undefined);
                      }}>Reject</button>
                    )}
                    {r.status!=="pending" && (
                      <button className="btn btn-xs btn-outline" onClick={()=>updateStatus([id],"pending")}>Pending</button>
                    )}
                  </td>
                </tr>
              );
            })}

            {rows.length===0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  {loading ? "Loading…" : "No requests found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk actions & Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn btn-sm btn-success" disabled={!selected.size} onClick={()=>updateStatus([...selected],"approved")}>Approve Selected</button>
          <button className="btn btn-sm btn-error" disabled={!selected.size} onClick={()=>{
            const note = prompt("Reason (optional)");
            updateStatus([...selected],"rejected",note||undefined);
          }}>Reject Selected</button>
          <button className="btn btn-sm" disabled={!selected.size} onClick={()=>updateStatus([...selected],"pending")}>Set Pending</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <span className="text-sm">Page {page} / {pages}</span>
          <button className="btn btn-sm" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>

      {/* View modal (unchanged) */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Adoption Request</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Request ID:</span> {modal._id || modal.id}</div>
              <div><span className="font-medium">Pet:</span> {modal.pet?.name || modal.petName} ({modal.pet?.species || modal.petSpecies || ""})</div>
              <div><span className="font-medium">Adopter:</span> {modal.adopter?.name || modal.userName || modal.applicant?.fullName} — {modal.adopter?.email || modal.userEmail || modal.applicant?.email}</div>
              <div><span className="font-medium">Status:</span> {modal.status}</div>
              {modal.note ? <div><span className="font-medium">Note:</span> {modal.note}</div> : null}
              <div><span className="font-medium">Requested:</span> {new Date(modal.createdAt || Date.now()).toLocaleString()}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-outline btn-sm" onClick={()=>setModal(null)}>Close</button>
              <button className="btn btn-success btn-sm" onClick={()=>{ updateStatus([modal._id || modal.id],"approved"); setModal(null); }}>Approve</button>
              <button className="btn btn-error btn-sm" onClick={()=>{ const note = prompt("Reason (optional)"); updateStatus([modal._id || modal.id],"rejected",note||undefined); setModal(null); }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
