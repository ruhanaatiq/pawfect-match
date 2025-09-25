import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await connectDB();

  const [total, pending, approved, rejected] = await Promise.all([
    AdoptionRequest.countDocuments({}),
    AdoptionRequest.countDocuments({ status: "Pending" }),
    AdoptionRequest.countDocuments({ status: "Approved" }),
    AdoptionRequest.countDocuments({ status: "Rejected" }),
  ]);

  const cards = [
    { label: "Total Requests", value: total },
    { label: "Pending", value: pending },
    { label: "Approved", value: approved },
    { label: "Rejected", value: rejected },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4C3D3D] mb-6">Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="text-sm text-[#4C3D3D]/60">{c.label}</div>
            <div className="mt-2 text-2xl font-extrabold text-[#4C3D3D]">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6">
        <h3 className="text-lg font-semibold text-[#4C3D3D] mb-2">Quick Links</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a className="rounded-md border px-3 py-2 hover:bg-emerald-50" href="/admin/requests">View Adoption Requests</a>
          {/* Add: /admin/pets, /admin/users, /admin/settings */}
        </div>
      </div>
    </div>
  );
}
