"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Check, X, Trash2, Search, Loader2 } from "lucide-react";

/* Small helpers */
const fmtDate = (v) =>
  v ? new Date(v).toLocaleString(undefined, { hour12: true }) : "—";
const badgeTone = (s) => {
  const k = String(s || "pending").toLowerCase();
  if (k === "approved") return "badge-success";
  if (k === "rejected") return "badge-error";
  return "badge-warning";
};

export default function AdminSponsorshipRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | pending | approved | rejected
  const [page, setPage] = useState(1);
  const pageSize = 8;

  /* fetch data */
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

  /* filter + paginate */
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = status === "all" || (r.status ?? "pending") === status;
      const blob = `${r.companyName ?? r.org ?? ""} ${r.contactName ?? ""} ${r.email ?? r.userEmail ?? ""} ${r.phone ?? ""} ${r.message ?? ""}`.toLowerCase();
      const matchesQ = !term || blob.includes(term);
      return matchesStatus && matchesQ;
    });
  }, [rows, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  /* actions */
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
      setRows((prev) => prev.map((r) => (String(r._id) === String(id) ? { ...r, status: next } : r)));
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

  /* loading state */
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
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
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

      {/* Desktop table */}
      <div className="hidden md:block overflow-auto rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5">
        <table className="table table-zebra">
          <thead className="sticky top-0 bg-white/95 backdrop-blur z-10">
            <tr className="text-gray-600">
              <th className="w-[22%]">Company</th>
              <th className="w-[14%]">Contact</th>
              <th className="w-[20%]">Email</th>
              <th className="w-[12%]">Phone</th>
              <th className="w-[16%]">Applied</th>
              <th className="w-[10%]">Status</th>
              <th className="w-[16%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r._id} className="hover">
                <td className="font-medium">
                  <div className="truncate max-w-[260px]" title={r.companyName ?? r.org ?? ""}>
                    {r.companyName ?? r.org ?? "—"}
                  </div>
                </td>
                <td>
                  <div className="truncate max-w-[180px]" title={r.contactName ?? ""}>
                    {r.contactName ?? "—"}
                  </div>
                </td>
                <td>
                  <div className="truncate max-w-[240px]" title={r.email ?? r.userEmail ?? ""}>
                    {r.email ?? r.userEmail ?? "—"}
                  </div>
                </td>
                <td>
                  <div className="truncate max-w-[140px]" title={r.phone ?? ""}>
                    {r.phone ?? "—"}
                  </div>
                </td>
                <td className="text-sm text-gray-600">{fmtDate(r.appliedAt)}</td>
                <td>
                  <span className={`badge ${badgeTone(r.status)} badge-sm`}>
                    {String(r.status ?? "pending").toLowerCase()}
                  </span>
                </td>
                <td className="text-right space-x-2 whitespace-nowrap">
                  <button
                    className="btn btn-xs btn-success"
                    onClick={() => updateStatus(r._id, "approved")}
                    disabled={r.status === "approved"}
                    title="Approve"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span className="ml-1 hidden lg:inline">Approve</span>
                  </button>
                  <button
                    className="btn btn-xs btn-warning"
                    onClick={() => updateStatus(r._id, "rejected")}
                    disabled={r.status === "rejected"}
                    title="Reject"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="ml-1 hidden lg:inline">Reject</span>
                  </button>
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => removeRow(r._id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="ml-1 hidden lg:inline">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
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

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {slice.map((r) => (
          <div
            key={r._id}
            className="rounded-xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{r.companyName ?? r.org ?? "—"}</div>
                <div className="text-sm text-gray-500">{r.contactName ?? "—"}</div>
              </div>
              <span className={`badge ${badgeTone(r.status)} badge-sm`}>
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
            <div className="mt-3 flex gap-2">
              <button
                className="btn btn-xs btn-success flex-1"
                onClick={() => updateStatus(r._id, "approved")}
                disabled={r.status === "approved"}
              >
                <Check className="h-3.5 w-3.5" /> <span className="ml-1">Approve</span>
              </button>
              <button
                className="btn btn-xs btn-warning flex-1"
                onClick={() => updateStatus(r._id, "rejected")}
                disabled={r.status === "rejected"}
              >
                <X className="h-3.5 w-3.5" /> <span className="ml-1">Reject</span>
              </button>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => removeRow(r._id)}
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {!slice.length && (
          <div className="rounded-xl bg-white/90 shadow-sm ring-1 ring-black/5 p-6 text-center text-gray-500">
            No results.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-2">
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
  );
}
