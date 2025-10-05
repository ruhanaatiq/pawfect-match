export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { absoluteUrl } from "@/lib/absolute-url";

function canManage(session, shelterId) {
  return (session?.shelters || []).some(
    s => s.shelterId === shelterId && ["shelter_owner","shelter_manager"].includes(s.role)
  );
}

async function loadData() {
  const res = await fetch(absoluteUrl("/api/shelter/staff"), { cache: "no-store" });
  if (!res.ok) return { shelterId: null, members: [], invites: [] };
  return res.json();
}

export default async function StaffPage() {
  const session = await auth();
  if (!session?.user) return <div className="p-6">Login required</div>;

  const { shelterId, members, invites } = await loadData();
  if (!shelterId) return <div className="p-6">No shelter found for your account.</div>;

  const allowed = canManage(session, shelterId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#4C3D3D]">Staff</h1>
        {allowed && <InviteButton shelterId={shelterId} />}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="px-4 py-3 border-b font-medium">Members</div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.length ? members.map(m => (
                <tr key={m.id}>
                  <td className="px-4 py-2">
                    <div className="font-medium">{m.user?.name || m.user?.email}</div>
                    <div className="text-xs text-gray-500">{m.user?.email}</div>
                  </td>
                  <td className="px-4 py-2 capitalize">{m.role.replace("shelter_","").replace("_"," ")}</td>
                  <td className="px-4 py-2 text-right">
                    {allowed && <MemberActions memberId={m.id} currentRole={m.role} />}
                  </td>
                </tr>
              )) : (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={3}>No members</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Invites */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="px-4 py-3 border-b font-medium">Pending Invites</div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Expires</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invites.length ? invites.map(i => (
                <tr key={i.id}>
                  <td className="px-4 py-2">{i.email}</td>
                  <td className="px-4 py-2 capitalize">{i.role.replace("shelter_","").replace("_"," ")}</td>
                  <td className="px-4 py-2">{new Date(i.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">
                    {allowed && <RevokeInviteButton inviteId={i.id} />}
                  </td>
                </tr>
              )) : (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={4}>No pending invites</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------- CLIENT PARTS -------- */
function InviteButton({ shelterId }) {
  "use client";
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700">
        Invite Staff
      </button>
      {open && <InviteModal shelterId={shelterId} onClose={() => setOpen(false)} />}
    </>
  );
}

function InviteModal({ shelterId, onClose }) {
  "use client";
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("shelter_staff");
  const [link, setLink] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/shelter/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shelterId, email, role }),
      });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || "Failed");
      setLink(j.inviteLink);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg space-y-3">
        <div className="text-lg font-semibold">Invite Staff</div>
        {error && <div className="rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Email</span>
          <input className="rounded-xl border px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Role</span>
          <select className="rounded-xl border px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="shelter_manager">Manager</option>
            <option value="shelter_staff">Staff</option>
            <option value="shelter_volunteer">Volunteer</option>
          </select>
        </label>

        <div className="flex gap-2 pt-2">
          <button disabled={loading} className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-50">
            {loading ? "Sending…" : "Send Invite"}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">Close</button>
        </div>

        {link && (
          <div className="text-xs mt-2">
            Dev invite link (copy): <a className="text-emerald-700 underline break-all" href={link}>{link}</a>
          </div>
        )}
      </form>
    </div>
  );
}

function MemberActions({ memberId, currentRole }) {
  "use client";
  const [busy, setBusy] = React.useState(false);
  async function change(role) {
    setBusy(true);
    await fetch(`/api/shelter/staff/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    location.reload();
  }
  async function removeMember() {
    if (!confirm("Remove this member?")) return;
    setBusy(true);
    await fetch(`/api/shelter/staff/${memberId}`, { method: "DELETE" });
    location.reload();
  }
  return (
    <div className="inline-flex gap-2">
      <select disabled={busy} defaultValue={currentRole} onChange={e=>change(e.target.value)} className="rounded border px-2 py-1 text-xs">
        <option value="shelter_manager">Manager</option>
        <option value="shelter_staff">Staff</option>
        <option value="shelter_volunteer">Volunteer</option>
      </select>
      <button disabled={busy} onClick={removeMember} className="rounded bg-red-600 text-white px-2 py-1 text-xs">Remove</button>
    </div>
  );
}

function RevokeInviteButton({ inviteId }) {
  "use client";
  const [busy, setBusy] = React.useState(false);
  async function revoke() {
    if (!confirm("Revoke this invite?")) return;
    setBusy(true);
    await fetch(`/api/shelter/staff/invite/${inviteId}`, { method: "DELETE" });
    location.reload();
  }
  return (
    <button disabled={busy} onClick={revoke} className="rounded border px-3 py-1 text-xs hover:bg-gray-50">
      Revoke
    </button>
  );
}
