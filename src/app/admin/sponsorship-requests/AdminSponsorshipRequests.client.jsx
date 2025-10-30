"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Check, X, Trash2, Search, Loader2 } from "lucide-react";

/* helpers */
const fmtDate = (v) =>
  v ? new Date(v).toLocaleString(undefined, { hour12: true }) : "—";
const tone = (s) => {
  const k = String(s || "pending").toLowerCase();
  if (k === "approved") return "text-emerald-700 bg-emerald-50 ring-emerald-200";
  if (k === "rejected") return "text-rose-700 bg-rose-50 ring-rose-200";
  return "text-amber-700 bg-amber-50 ring-amber-200";
};
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("") || "•";

export default function AdminSponsorshipRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | pending | approved | rejected
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/sponsors", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const data = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        if (!cancelled) setRows(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error("Failed to load sponsorship requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = status === "all" || (r.status ?? "pending") === status;
      const blob = `${r.companyName ?? r.org ?? ""} ${r.contactName ?? ""} ${
        r.email ?? r.userEmail ?? ""
      } ${r.phone ?? ""} ${r.message ?? ""}`.toLowerCase();
      const matchesQ = !term || blob.includes(term);
      return matchesStatus && matchesQ;
    });
  }, [rows, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const updateStatus = async (id, next) => {
    try {
      const res = await fetch(`/api/sponsors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      setRows((prev) =>
        prev.map((r) => (String(r._id) === String(id) ? { ...r, status: next } : r))
      );
      toast.success(`Marked as ${next}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const removeRow = async (id) => {
    if (!confirm("Delete this request?")) return;
    try {
      const res = await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows((prev) => prev.filter((r) => String(r._id) !== String(id)));
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-6 flex items-center gap-3">
        <Loader2 className="animate-spin" />
        <span>Loading sponsorship requests…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#4C3D3D]">Sponsorship Requests</h2>
        <div className="text-sm text-gray-500">Admin tools · Approve / Reject / Delete</div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search company, contact, email…"
            className="input input-bordered w-full pl-10"
          />
        </div>

        <select
          className="select select-bordered sm:w-44"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="sm:ml-auto text-sm text-gray-500">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} · Page {pageSafe}/{totalPages}
        </div>
      </div>

      {/* Table card — styled like Admin Pets list */}
      <div className="overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900">
                <th className="rounded-tl-2xl">Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Applied</th>
                <th>Status</th>
                <th className="rounded-tr-2xl text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr:last-child]:border-b-0">
              {slice.map((r) => {
                const company = r.companyName ?? r.org ?? "—";
                return (
                  <tr
                    key={r._id}
                    className="hover:bg-emerald-50/40 transition-colors"
                  >
                    {/* company with tiny avatar bubble (mirrors pet thumbnail feel) */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center font-semibold">
                          {initials(company)}
                        </div>
                        <div className="leading-tight">
                          <div className="font-medium">{company}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[220px]">
                            {r.message ? r.message : ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap">{r.contactName ?? "—"}</td>

                    <td>
                      <div className="truncate max-w-[260px]" title={r.email ?? r.userEmail ?? ""}>
                        {r.email ?? r.userEmail ?? "—"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap">{r.phone ?? "—"}</td>

                    <td className="text-sm text-gray-600 whitespace-nowrap">
                      {fmtDate(r.appliedAt)}
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs ring-1 ${tone(
                          r.status
                        )}`}
                      >
                        {String(r.status ?? "pending").toLowerCase()}
                      </span>
                    </td>

                    {/* Text-link actions aligned right like "Campaigns Edit Delete" */}
                    <td className="text-right pr-6 whitespace-nowrap">
                      <button
                        className="text-emerald-700 hover:underline mr-3"
                        onClick={() => updateStatus(r._id, "approved")}
                        disabled={r.status === "approved"}
                        title="Approve"
                      >
                        Approve
                      </button>
                      <button
                        className="text-amber-700 hover:underline mr-3"
                        onClick={() => updateStatus(r._id, "rejected")}
                        disabled={r.status === "rejected"}
                        title="Reject"
                      >
                        Reject
                      </button>
                      <button
                        className="text-rose-700 hover:underline"
                        onClick={() => removeRow(r._id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!slice.length && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No results on this page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-center gap-3 p-3 border-t bg-white/60">
          <button
            className="btn btn-sm"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{pageSafe}</span> of {totalPages}
          </div>
          <button
            className="btn btn-sm"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile cards (kept minimal, aligned with overall tone) */}
      <div className="md:hidden space-y-3">
        {slice.map((r) => (
          <div key={r._id} className="rounded-xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center font-semibold">
                  {initials(r.companyName ?? r.org ?? "")}
                </div>
                <div>
                  <div className="font-semibold">{r.companyName ?? r.org ?? "—"}</div>
                  <div className="text-sm text-gray-500">{r.contactName ?? "—"}</div>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-md text-xs ring-1 ${tone(
                  r.status
                )}`}
              >
                {String(r.status ?? "pending").toLowerCase()}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div className="truncate" title={r.email ?? r.userEmail ?? ""}>
                {r.email ?? r.userEmail ?? "—"}
              </div>
              <div>{r.phone ?? "—"}</div>
              <div>{fmtDate(r.appliedAt)}</div>
            </div>
            <div className="mt-3 text-right">
              <button
                className="text-emerald-700 hover:underline mr-3"
                onClick={() => updateStatus(r._id, "approved")}
                disabled={r.status === "approved"}
              >
                Approve
              </button>
              <button
                className="text-amber-700 hover:underline mr-3"
                onClick={() => updateStatus(r._id, "rejected")}
                disabled={r.status === "rejected"}
              >
                Reject
              </button>
              <button className="text-rose-700 hover:underline" onClick={() => removeRow(r._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
