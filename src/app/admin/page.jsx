// src/app/admin/page.jsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";

function dayKeys(n = 7) {
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
  if (!points.length) return <div className="h-24" aria-hidden="true" />;
  const w = 260;
  const h = 80;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const dx = w / Math.max(points.length - 1, 1);
  const ny = (v) => (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);
  const d = points.map((v, i) => `${i ? "L" : "M"} ${i * dx} ${ny(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" role="img" aria-label="7-day requests sparkline">
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
      <div className="shrink-0 rounded-xl bg-emerald-50 p-3" aria-hidden="true">{icon}</div>
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
  // auth guard
  const session = await auth();
  const role = session?.user?.role;
  if (!["admin", "superadmin"].includes(role)) {
    // You can also redirect("/login") if you prefer
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Forbidden</h2>
        <p className="mt-2 text-gray-600">You don’t have access to the admin dashboard.</p>
      </div>
    );
  }

  await connectDB();

  try {
    // --- counts in ONE aggregation (case-insensitive) ---
    const countsAgg = await AdoptionRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [
                { $in: [{ $toLower: "$status" }, ["pending"]] },
                1,
                0,
              ],
            },
          },
          approved: {
            $sum: {
              $cond: [
                { $in: [{ $toLower: "$status" }, ["approved"]] },
                1,
                0,
              ],
            },
          },
          rejected: {
            $sum: {
              $cond: [
                { $in: [{ $toLower: "$status" }, ["rejected"]] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: { _id: 0, total: 1, pending: 1, approved: 1, rejected: 1 },
      },
    ]);

    const { total = 0, pending = 0, approved = 0, rejected = 0 } = countsAgg[0] || {};

    // --- weekly trend (by createdAt) ---
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
    const weekly = keys.map((k) => map.get(k) ?? 0);

    // --- latest pending ---
    const latestPending = await AdoptionRequest.find(
      { status: { $in: ["Pending", "pending"] } },
      { petName: 1, applicant: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return (
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#4C3D3D]">Overview</h2>
          <Link href="/admin/requests" className="rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-700">
            Review Requests
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Requests"
            value={total}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-600">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />
          <StatCard
            label="Pending"
            value={pending}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-600">
                <path d="M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            }
          />
          <StatCard
            label="Approved"
            value={approved}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-600">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            }
          />
          <StatCard
            label="Rejected"
            value={rejected}
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
              <Link href="/admin/requests" className="text-sm text-emerald-700 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-2">
              <Sparkline points={weekly} />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white shadow-sm ring-1 ring-black/5 p-4">
            <div className="text-sm text-gray-600 mb-2">Quick Actions</div>
            <div className="flex flex-col gap-2">
              <Link className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/requests">
                Manage Adoption Requests
              </Link>
              <Link className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/pets">
                Manage Pets
              </Link>
              <Link className="rounded-md border px-3 py-2 hover:bg-emerald-50" href="/dashboard/shelter/staff">
                Invite / Manage Staff
              </Link>
              <Link className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/shelters">
                Manage Shelters
              </Link>
              <Link className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/shelters/new">
                Add Shelter
              </Link>
              <Link className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/users">
                Manage Users
              </Link>
                            <Link className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/admin/pets/healthrecords">Update Health records</Link>
                <Link className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href="/campaigns">
                Add Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* pending list */}
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-900">Pending Requests</div>
            <Link href="/admin/requests?status=pending" className="text-sm text-emerald-700 hover:underline">
              See all
            </Link>
          </div>
          <ul className="divide-y">
            {latestPending.length ? (
              latestPending.map((r) => (
                <li key={String(r._id)} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{r.petName ?? "Pet"}</div>
                    <div className="text-xs text-gray-500">
                      {(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka" }).format(new Date(r.createdAt)))}
                      {" • "}
                      {r.applicant?.fullName ?? "Applicant"}
                    </div>
                  </div>
                  <Link
                    href={`/admin/requests?focus=${String(r._id)}`}
                    className="rounded-lg bg-emerald-600 text-white text-xs px-3 py-1.5 hover:bg-emerald-700"
                  >
                    Review
                  </Link>
                </li>
              ))
            ) : (
              <div className="py-10 text-center text-gray-500 text-sm">No pending requests</div>
            )}
          </ul>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="text-xl font-semibold text-red-700">Something went wrong</h2>
        <p className="mt-2 text-gray-600">We couldn’t load the admin overview. Please try again.</p>
      </div>
    );
  }
}
