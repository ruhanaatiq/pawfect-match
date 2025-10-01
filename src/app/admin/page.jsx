// src/app/admin/page.jsx
export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";

// --- helpers ---------------------------------------------------------------
function dayKeys(n = 7) {
  // returns last n day keys like '2025-10-01'
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() - i);
    out.push(t.toISOString().slice(0, 10));
  }
  return out;
}

function Sparkline({ points = [] }) {
  if (!points.length) return <div className="h-24" />;
  const w = 260;
  const h = 80;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const dx = w / Math.max(points.length - 1, 1);
  const ny = (v) => (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);
  const d = points.map((v, i) => `${i ? "L" : "M"} ${i * dx} ${ny(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
      <path d={d} stroke="currentColor" strokeWidth="2.5" fill="none" className="text-emerald-500" />
      {points.map((v, i) => (
        <circle key={i} cx={i * dx} cy={ny(v)} r="2.5" className="fill-emerald-500" />
      ))}
    </svg>
  );
}

function StatCard({ label, value, delta, icon }) {
  return (
    <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4 flex items-start gap-4">
      <div className="shrink-0 rounded-xl bg-emerald-50 p-3">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
        {delta ? <div className="mt-0.5 text-xs text-emerald-600">{delta}</div> : null}
      </div>
    </div>
  );
}

// --- page ------------------------------------------------------------------
export default async function AdminHome() {
  await connectDB();

  // counts
  const [total, pending, approved, rejected] = await Promise.all([
    AdoptionRequest.countDocuments({}),
    AdoptionRequest.countDocuments({ status: { $in: ["Pending", "pending"] } }),
    AdoptionRequest.countDocuments({ status: { $in: ["Approved", "approved"] } }),
    AdoptionRequest.countDocuments({ status: { $in: ["Rejected", "rejected"] } }),
  ]);

  // last 7 days trend (by createdAt)
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const grouped = await AdoptionRequest.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  const keys = dayKeys(7);
  const map = new Map(grouped.map((g) => [g._id, g.count]));
  const weekly = keys.map((k) => map.get(k) || 0);

  // few latest pending for the list
  const latestPending = await AdoptionRequest.find(
    { status: { $in: ["Pending", "pending"] } },
    { petName: 1, applicant: 1, createdAt: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const cards = [
    { key: "total", label: "Total Requests", value: total, delta: "" },
    { key: "pending", label: "Pending", value: pending, delta: "" },
    { key: "approved", label: "Approved", value: approved, delta: "" },
    { key: "rejected", label: "Rejected", value: rejected, delta: "" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#4C3D3D]">Overview</h2>
        <a href="/admin/requests" className="rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-700">
          Review Requests
        </a>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={cards[0].value}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-600">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
        />
        <StatCard
          label="Pending"
          value={cards[1].value}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-600">
              <path d="M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          }
        />
        <StatCard
          label="Approved"
          value={cards[2].value}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-600">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          }
        />
        <StatCard
          label="Rejected"
          value={cards[3].value}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-600">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
        />
      </div>

      {/* trend + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Weekly Requests</div>
              <div className="text-lg font-semibold text-gray-900">Last 7 days</div>
            </div>
            <a href="/admin/requests" className="text-sm text-emerald-700 hover:underline">
              View all
            </a>
          </div>
          <div className="mt-2">
            <Sparkline points={weekly} />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white shadow-sm ring-1 ring-black/5 p-4">
          <div className="text-sm text-gray-600 mb-2">Quick Actions</div>
          <div className="flex flex-col gap-2">
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/requests">
              Manage Adoption Requests
            </a>
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/pets">
              Manage Pets
            </a>
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/staff">
              Invite / Manage Staff
            </a>
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/shelters">Manage Shelters</a>
<a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/shelters/new">Add Shelter</a>
<a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/users">Manage Users</a>

          </div>
        </div>
      </div>

      {/* pending list */}
      <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-gray-900">Pending Requests</div>
          <a href="/admin/requests?status=pending" className="text-sm text-emerald-700 hover:underline">
            See all
          </a>
        </div>
        <ul className="divide-y">
          {latestPending.length ? (
            latestPending.map((r) => (
              <li key={String(r._id)} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">{r.petName ?? "Pet"}</div>
                  <div className="text-xs text-gray-500">
                    {r.applicant?.fullName ?? "Applicant"} • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={`/admin/requests?focus=${String(r._id)}`}
                  className="rounded-lg bg-emerald-600 text-white text-xs px-3 py-1.5 hover:bg-emerald-700"
                >
                  Review
                </a>
              </li>
            ))
          ) : (
            <div className="py-10 text-center text-gray-500 text-sm">No pending requests</div>
          )}
        </ul>
      </div>
    </div>
  );
}
