// src/app/dashboard/shelter/page.jsx
export const dynamic = "force-dynamic";
import { absoluteUrl } from "@/lib/absolute-url";

async function fetchOverview() {
  const res = await fetch(absoluteUrl("/api/shelter/overview"), { cache: "no-store" });
  if (!res.ok) return { cards: [], pending: [], upcoming: [] };
  return res.json();
}

export default async function ShelterOverview() {
  const { cards, pending, upcoming } = await fetchOverview();
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-xl font-semibold">Shelter Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.key} className="card bg-white shadow rounded-2xl p-4">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-gray-400">{c.delta}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="font-medium mb-3">Pending Requests</div>
          <ul className="divide-y">
            {pending.map(r => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.petName}</div>
                  <div className="text-xs text-gray-500">
                    {r.applicant.fullName} • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <a href={`/dashboard/shelter/requests?focus=${r.id}`} className="btn btn-sm">Review</a>
              </li>
            ))}
            {!pending.length && <div className="text-gray-500 text-sm py-8 text-center">No pending requests</div>}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="font-medium mb-3">Upcoming Appointments</div>
          <ul className="divide-y">
            {upcoming.map(a => (
              <li key={a.id} className="py-3">
                <div className="font-medium">{a.petName} — {new Date(a.at).toLocaleString()}</div>
                <div className="text-xs text-gray-500">{a.applicant.fullName} • {a.location}</div>
              </li>
            ))}
            {!upcoming.length && <div className="text-gray-500 text-sm py-8 text-center">Nothing scheduled</div>}
          </ul>
        </div>
      </div>
    </div>
  );
}
