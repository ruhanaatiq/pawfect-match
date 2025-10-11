"use client";

import { useEffect, useMemo, useState } from "react";

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-blue-100 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-100 text-amber-700 ring-amber-200",
    red: "bg-rose-100 text-rose-700 ring-rose-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function InvitesCard({ shelterId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [ttl, setTtl] = useState(72);
  const [sending, setSending] = useState(false);

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shelters/${shelterId}/invites/list`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setInvites(data.items || []);
      else alert(data?.error || "Failed to load invites");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [shelterId]);

  async function onSend(e) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/shelters/${shelterId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, ttlHours: Number(ttl) || 72 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send invite");
      setEmail("");
      await load();
      if (data.inviteUrl) {
        await navigator.clipboard.writeText(data.inviteUrl);
        alert("Invite sent. Link copied to clipboard.");
      } else {
        alert("Invite sent.");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  }

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      alert("Copied link");
    } catch { /* noop */ }
  }

  async function resend(id) {
    const res = await fetch(`/api/admin/invites/${id}/resend`, { method: "POST" });
    const data = await res.json();
    if (res.ok) alert("Resent invite.");
    else alert(data?.error || "Failed to resend");
  }

  async function revoke(id) {
    if (!confirm("Revoke this invite?")) return;
    const res = await fetch(`/api/admin/invites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "revoked" }),
    });
    const data = await res.json();
    if (res.ok) {
      await load();
      alert("Invite revoked.");
    } else {
      alert(data?.error || "Failed to revoke");
    }
  }

  const rows = useMemo(() => invites.map(i => ({
    ...i,
    expiresAtFmt: i.expiresAt ? new Date(i.expiresAt).toLocaleString() : "—",
    createdAtFmt: i.createdAt ? new Date(i.createdAt).toLocaleString() : "—",
  })), [invites]);

  const statusTone = (s) => {
    switch ((s || "").toLowerCase()) {
      case "pending": return "amber";
      case "accepted": return "emerald";
      case "revoked": return "gray";
      case "expired": return "red";
      default: return "slate";
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="border-b px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#4C3D3D]">Invites</h2>
          <p className="text-sm text-gray-600">Send staff/manager/owner invitations for this shelter.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSend} className="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@example.com"
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          >
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Expires (hrs)</label>
          <input
            type="number"
            min={1}
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div className="md:col-span-1 flex items-end">
          <button
            disabled={sending}
            className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="px-5 pb-5">
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Sent</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading…</td>
                </tr>
              ) : rows.length ? (
                rows.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 break-all">{inv.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone="blue">{inv.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inv.expiresAtFmt}</td>
                    <td className="px-4 py-3 text-gray-700">{inv.createdAtFmt}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {inv.inviteUrl && (
                          <button
                            type="button"
                            className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                            onClick={() => copyLink(inv.inviteUrl)}
                          >
                            Copy
                          </button>
                        )}
                        {inv.status === "pending" && (
                          <>
                            <button
                              type="button"
                              className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                              onClick={() => resend(inv._id)}
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border px-3 py-1.5 text-rose-700 hover:bg-rose-50"
                              onClick={() => revoke(inv._id)}
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        📨
                      </div>
                      <div className="font-medium text-gray-900">No invites yet</div>
                      <div className="text-sm text-gray-600">Send an invite to add staff to this shelter.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
