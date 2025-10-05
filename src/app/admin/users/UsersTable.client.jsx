// src/app/admin/users/UsersTable.client.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

function Pill({ children, tone = "gray" }) {
  const t = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-sky-100 text-sky-700",
  }[tone];
  return <span className={`px-2 py-0.5 rounded-full text-xs ${t}`}>{children}</span>;
}

export default function UsersTable() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (role) p.set("role", role);
    if (status) p.set("status", status);
    p.set("page", String(page));
    p.set("limit", String(limit));
    return p.toString();
  }, [q, role, status, page, limit]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users?${query}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load users");
      setData(json);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [query]); // eslint-disable-line

  async function updateUser(id, patch) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Update failed");
    // refresh
    load();
    return json.user;
  }

  async function deleteUser(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Delete failed");
    load();
  }

  return (
    <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
      {/* controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            placeholder="Search name or email..."
            className="rounded-xl border px-3 py-2 w-64"
          />
          <select value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }} className="rounded-xl border px-3 py-2">
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="shelter">Shelter</option>
            <option value="admin">Admin</option>
          </select>
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="rounded-xl border px-3 py-2">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          {loading ? "Loading…" : `${data.total} user${data.total === 1 ? "" : "s"}`}
        </div>
      </div>

      {/* error */}
      {err ? <div className="mt-3 rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm">{err}</div> : null}

      {/* table */}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.items.map((u) => (
              <tr key={String(u._id)}>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    {/* avatar */}
                    <img
                      src={u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || u.email)}`}
                      alt=""
                      className="h-8 w-8 rounded-full ring-1 ring-black/5"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{u.fullName || "—"}</div>
                      <div className="text-xs text-gray-500">{u._id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">
                  <Pill tone={u.role === "admin" || u.role === "superadmin" ? "blue" : "gray"}>{u.role}</Pill>
                </td>
                <td className="py-2 pr-4">
                  <Pill tone={u.status === "active" ? "green" : u.status === "suspended" ? "red" : "yellow"}>{u.status}</Pill>
                </td>
                <td className="py-2 pr-4">
                  {new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka" }).format(new Date(u.createdAt))}
                </td>
                <td className="py-2 pr-0">
                  <div className="flex justify-end gap-2">
                    {/* role cycling: user -> seller -> admin (superadmin only by superadmin) */}
                    <button
                      className="rounded-lg border px-2 py-1 hover:bg-emerald-50"
                      onClick={async () => {
                        const next = prompt("Set role (user, seller, admin):", u.role);
                        if (!next || next === u.role) return;
                        try { await updateUser(u._id, { role: next }); } catch (e) { alert(e.message); }
                      }}
                    >
                      Set Role
                    </button>
                    {/* status toggle */}
                    <button
                      className="rounded-lg border px-2 py-1 hover:bg-amber-50"
                      onClick={async () => {
                        const next = u.status === "active" ? "suspended" : "active";
                        if (!confirm(`Change status to ${next}?`)) return;
                        try { await updateUser(u._id, { status: next }); } catch (e) { alert(e.message); }
                      }}
                    >
                      {u.status === "active" ? "Suspend" : "Activate"}
                    </button>
                    {/* delete */}
                    <button
                      className="rounded-lg border px-2 py-1 hover:bg-rose-50"
                      onClick={async () => { try { await deleteUser(u._id); } catch (e) { alert(e.message); } }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!data.items.length && !loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-500">No users found</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">Page {data.page} of {data.totalPages}</div>
        <div className="flex gap-2">
          <button
            disabled={data.page <= 1 || loading}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            disabled={data.page >= data.totalPages || loading}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
