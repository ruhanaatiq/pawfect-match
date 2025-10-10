"use client";

import { useEffect, useState } from "react";

export default function InvitesCard({ shelterId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [ttl, setTtl] = useState(72); // hours
  const [pending, setPending] = useState(false);
  const [invites, setInvites] = useState([]);

  async function loadInvites() {
    const res = await fetch(`/api/admin/shelters/${shelterId}/invites/list`, { cache: "no-store" });
    if (res.ok) setInvites((await res.json()).items || []);
  }

  useEffect(() => { loadInvites(); }, [shelterId]);

  async function onSend(e) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/admin/shelters/${shelterId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, ttlHours: Number(ttl) || 72 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setEmail("");
      await loadInvites();
      alert("Invite sent. Link copied to clipboard.");
      if (data.inviteUrl) await navigator.clipboard.writeText(data.inviteUrl);
    } catch (err) {
      alert(err.message);
    } finally {
      setPending(false);
    }
  }

  async function copyLink(tokenPreviewOrUrl) {
    try {
      // If your list API returns inviteUrl, copy that; else build it if you prefer.
      await navigator.clipboard.writeText(tokenPreviewOrUrl);
      alert("Copied!");
    } catch { /* noop */ }
  }

  async function resend(inviteId) {
    const res = await fetch(`/api/admin/invites/${inviteId}/resend`, { method: "POST" });
    const data = await res.json();
    if (res.ok) alert("Resent invite.");
    else alert(data?.error || "Failed");
  }

  async function revoke(inviteId) {
    if (!confirm("Revoke this invite?")) return;
    const res = await fetch(`/api/admin/invites/${inviteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "revoked" }),
    });
    const data = await res.json();
    if (res.ok) { await loadInvites(); alert("Revoked."); }
    else alert(data?.error || "Failed");
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Invites</h2>

        <form onSubmit={onSend} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <label className="form-control">
            <span className="label-text">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered"
              placeholder="person@example.com"
            />
          </label>

          <label className="form-control">
            <span className="label-text">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select select-bordered"
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">Expires (hrs)</span>
            <input
              type="number"
              min={1}
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              className="input input-bordered"
            />
          </label>

          <button disabled={pending} className="btn btn-primary">
            {pending ? "Sending..." : "Send invite"}
          </button>
        </form>

        <div className="divider" />

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(invites || []).map(inv => (
                <tr key={inv._id}>
                  <td>{inv.email}</td>
                  <td><span className="badge">{inv.role}</span></td>
                  <td>{inv.status}</td>
                  <td>{inv.expiresAt ? new Date(inv.expiresAt).toLocaleString() : "—"}</td>
                  <td className="flex flex-wrap gap-2">
                    {inv.inviteUrl && (
                      <button type="button" className="btn btn-xs" onClick={() => copyLink(inv.inviteUrl)}>
                        Copy link
                      </button>
                    )}
                    <button type="button" className="btn btn-xs" onClick={() => resend(inv._id)}>
                      Resend
                    </button>
                    {inv.status === "pending" && (
                      <button type="button" className="btn btn-xs btn-outline" onClick={() => revoke(inv._id)}>
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!invites?.length && (
                <tr><td colSpan={5} className="text-center text-sm text-gray-500">No invites yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
