import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import Pet from "@/models/Pet";
import AdoptionRequest from "@/models/AdoptionRequest";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session) return <div className="p-6">Please sign in.</div>;

  await connectDB();
  const shelters = await Shelter.find({ "members.userId": session.user._id }).lean();
  const s = shelters[0]; // pick first shelter for now
  if (!s) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">No shelter found for your account</h2>
        <div className="mt-4 flex gap-3">
          <a href="/dashboard/shelter/staff" className="btn btn-primary">I have an invite link</a>
          <a href="/dashboard/shelter/settings" className="btn">Add Shelter</a>
        </div>
      </div>
    );
  }

  const [petCount, pendingCount, upcoming] = await Promise.all([
    Pet.countDocuments({ shelterId: s._id }),
    AdoptionRequest.countDocuments({ shelterId: s._id, status: "pending" }),
    AdoptionRequest.find({ shelterId: s._id, appointmentAt: { $gte: new Date() } }).sort({ appointmentAt: 1 }).limit(5).lean(),
  ]);

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat title="Total Pets" value={petCount} />
        <Stat title="Pending Requests" value={pendingCount} />
        <Stat title="Verified" value={s.verifiedAt ? "Yes" : "No"} />
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h3 className="font-semibold mb-3">Upcoming Appointments</h3>
        {upcoming.length === 0 ? <p className="text-sm text-gray-500">No upcoming appointments</p> : (
          <ul className="divide-y">
            {upcoming.map(u => (
              <li key={u._id} className="py-2 text-sm">
                {new Date(u.appointmentAt).toLocaleString()} — request #{String(u._id).slice(-6)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
