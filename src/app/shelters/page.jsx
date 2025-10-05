import Link from "next/link";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";

export const dynamic = "force-dynamic";

export default async function SheltersPage() {
  await connectDB();
  const shelters = await Shelter.find({ status: "verified" }).lean();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {shelters.map((s) => (
        <Link
          key={String(s._id)}
          href={`/shelters/${s.publicSlug}`}
          className="rounded-xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4 hover:shadow-md"
        >
          <div className="font-semibold text-[#4C3D3D]">{s.name}</div>
          <div className="text-sm text-gray-600">{s.address || "—"}</div>
        </Link>
      ))}
      {!shelters.length && (
        <div className="sm:col-span-3 py-12 text-center text-gray-500">
          No shelters yet
        </div>
      )}
    </div>
  );
}
