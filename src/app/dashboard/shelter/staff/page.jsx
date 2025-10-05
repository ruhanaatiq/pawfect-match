// src/app/dashboard/shelter/staff/page.jsx
export const dynamic = "force-dynamic";

import React from "react";
import { auth } from "@/auth";

// Small helper to build an absolute URL for server-side fetches
function abs(path = "") {
  const base =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";
  return `${base}${path}`;
}

async function loadRoster() {
  const res = await fetch(abs("/api/shelter/staff"), { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function StatCard({ icon, label, value, subtle }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex items-center gap-3">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-50">
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-semibold text-[#4C3D3D] leading-tight">{value}</div>
        {subtle ? <div className="text-xs text-gray-400">{subtle}</div> : null}
      </div>
    </div>
  );
}

function RailLink({ href, children, active=false }) {
  return (
    <a
      href={href}
      className={`block rounded-xl px-3 py-2 text-sm ${
        active
          ? "bg-emerald-600 text-white"
          : "hover:bg-emerald-50 text-[#4C3D3D]"
      }`}
    >
      {children}
    </a>
  );
}

export default async function StaffPage() {
  const session = await auth();
  const data = await loadRoster();

  // No shelter membership (empty state)
  if (!data?.shelterId) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
              <div className="text-sm font-semibold text-[#4C3D3D] mb-2">Shelter</div>
              <div className="space-y-1 text-sm text-gray-500">
                <RailLink href="/dashboard/shelter">Overview</RailLink>
                <RailLink href="/dashboard/shelter/pets">Pets</RailLink>
                <RailLink href="/dashboard/shelter/requests">Requests</RailLink>
                <RailLink href="/dashboard/shelter/messages">Messages</RailLink>
                <RailLink href="/dashboard/shelter/appointments">Appointments</RailLink>
                <RailLink href="/dashboard/shelter/reviews">Reviews</RailLink>
                <RailLink href="/dashboard/shelter/reports">Reports</RailLink>
                <RailLink href="/dashboard/shelter/settings">Settings</RailLink>
                <RailLink href="/dashboard/shelter/staff" active>Staff</RailLink>
              </div>
            </div>
          </aside>

          <main className="col-span-12 md:col-span-9">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6">
              <h1 className="text-xl font-semibold text-[#4C3D3D]">No shelter found for your account</h1>
              <p className="text-sm text-gray-600 mt-2">
                You’re not a member of any shelter yet. Ask an owner/manager to invite you,
                or create a shelter if you’re the owner.
              </p>
              <div className="mt-4 flex gap-3">
                <a href="/admin/shelters/new" className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700">
                  Add Shelter
                </a>
                <a href="/admin/staff" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
                  I have an invite link
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { shelterId, members = [], invites = [] } = data;
  const canManage = (session?.shelters || []).some(
    (s) =>
      s.shelterId === shelterId &&
      ["shelter_owner", "shelter_manager"].includes(s.role)
  );

  const roleCount = (role) => members.filter((m) => m.role === role).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT RAIL */}
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
            <div className="text-sm font-semibold text-[#4C3D3D] mb-2">Shelter</div>
            <div className="space-y-1 text-sm text-gray-500">
              <RailLink href="/dashboard/shelter">Overview</RailLink>
              <RailLink href="/dashboard/shelter/pets">Pets</RailLink>
              <RailLink href="/dashboard/shelter/requests">Requests</RailLink>
              <RailLink href="/dashboard/shelter/messages">Messages</RailLink>
              <RailLink href="/dashboard/shelter/appointments">Appointments</RailLink>
              <RailLink href="/dashboard/shelter/reviews">Reviews</RailLink>
              <RailLink href="/dashboard/shelter/reports">Reports</RailLink>
              <RailLink href="/dashboard/shelter/settings">Settings</RailLink>
              <RailLink href="/dashboard/shelter/staff" active>Staff</RailLink>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="col-span-12 md:col-span-9 space-y-6">
          {/* header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#4C3D3D]">Team</h1>
              <p className="text-sm text-gray-600">Manage roles, invites, and team members.</p>
            </div>
            {canManage && <InviteButton shelterId={shelterId} />}
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon="👥" label="Members" value={members.length} />
            <StatCard icon="🧭" label="Managers" value={roleCount("shelter_manager")} />
            <StatCard icon="🧑‍⚕️" label="Staff" value={roleCount("shelter_staff")} />
            <StatCard icon="🤝" label="Volunteers" value={roleCount("shelter_volunteer")} />
            <StatCard icon="✉️" label="Pending Invites" value={invites.length} />
          </div>

          {/* content: members + invites */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Members */}
            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-medium">Members</div>
                {/* simple search (client) */}
                <MembersSearch />
              </div>
              <MembersTable members={members} canManage={canManage} />
            </section>

            {/* Invites */}
            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="px-4 py-3 border-b font-medium">Pending Invites</div>
              <InvitesTable invites={invites} canManage={canManage} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===================== CLIENT COMPONENTS ===================== */

function InviteButton({ shelterId }) {
  "use client";
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700"
      >
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
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [link, setLink] = React.useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setError("");
      const res = await fetch("/api/shelter/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shelterId, email, role }),
      });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || "Failed to send invite");
      setLink(j.inviteLink);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg space-y-4">
        <div className="text-lg font-semibold">Invite Staff</div>
        {error && <div className="rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border px-3 py-2"
            placeholder="person@example.com"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border px-3 py-2"
          >
            <option value="shelter_manager">Manager</option>
            <option value="shelter_staff">Staff</option>
            <option value="shelter_volunteer">Volunteer</option>
          </select>
        </label>

        <div className="flex gap-2">
          <button
            disabled={busy}
            className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send Invite"}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">
            Close
          </button>
        </div>

        {link && (
          <div className="text-xs">
            Dev invite link (copy):{" "}
            <a className="text-emerald-700 underline break-all" href={link}>
              {link}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}

function MembersSearch() {
  "use client";
  const [q, setQ] = React.useState("");
  React.useEffect(() => {
    const rows = document.querySelectorAll("[data-member-row]");
    rows.forEach((tr) => {
      const text = (tr.getAttribute("data-text") || "").toLowerCase();
      tr.style.display = !q || text.includes(q.toLowerCase()) ? "" : "none";
    });
  }, [q]);
  return (
    <input
      className="rounded-xl border px-3 py-1.5 text-sm"
      placeholder="Search name or email…"
      value={q}
      onChange={(e) => setQ(e.target.value)}
    />
  );
}

function MembersTable({ members, canManage }) {
  "use client";
  async function changeRole(memberId, role) {
    await fetch(`/api/shelter/staff/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    location.reload();
  }

  async function remove(memberId) {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/shelter/staff/${memberId}`, { method: "DELETE" });
    location.reload();
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">User</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 w-32"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.length ? (
            members.map((m) => {
              const text =
                `${m.user?.name || ""} ${m.user?.email || ""} ${m.role || ""}`.trim();
              return (
                <tr key={m.id} data-member-row data-text={text.toLowerCase()}>
                  <td className="px-4 py-2">
                    <div className="font-medium">{m.user?.name || m.user?.email || "—"}</div>
                    <div className="text-xs text-gray-500">{m.user?.email}</div>
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {m.role.replace("shelter_", "").replace("_", " ")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {canManage ? (
                      <div className="inline-flex gap-2">
                        <select
                          defaultValue={m.role}
                          onChange={(e) => changeRole(m.id, e.target.value)}
                          className="rounded border px-2 py-1 text-xs"
                        >
                          <option value="shelter_manager">Manager</option>
                          <option value="shelter_staff">Staff</option>
                          <option value="shelter_volunteer">Volunteer</option>
                        </select>
                        <button
                          onClick={() => remove(m.id)}
                          className="rounded bg-red-600 text-white px-2 py-1 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No actions</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                No members
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function InvitesTable({ invites, canManage }) {
  "use client";
  async function revoke(id) {
    if (!confirm("Revoke this invite?")) return;
    await fetch(`/api/shelter/staff/invite/${id}`, { method: "DELETE" });
    location.reload();
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Expires</th>
            <th className="px-4 py-2 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invites.length ? (
            invites.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-2">{i.email}</td>
                <td className="px-4 py-2 capitalize">{i.role.replace("shelter_", "").replace("_", " ")}</td>
                <td className="px-4 py-2">
                  {i.expiresAt ? new Date(i.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  {canManage ? (
                    <button
                      onClick={() => revoke(i.id)}
                      className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      Revoke
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">No actions</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                No pending invites
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
