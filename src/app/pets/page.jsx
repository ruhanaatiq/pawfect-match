// app/dashboard/shelter/pets/page.jsx
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function absoluteUrl(path = "/") {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return new URL(path, env).toString();
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host  = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return new URL(path, `${proto}://${host}`).toString();
}

async function getMyShelter() {
  const h = headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(absoluteUrl("/api/shelters/mine"), {
    cache: "no-store",
    headers: { cookie },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load shelter (${res.status})`);
  const data = await res.json();
  return data?.shelter ?? data;
}

export default async function ShelterPetsPage() {
  const shelter = await getMyShelter();

  if (!shelter) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-semibold mb-2">No shelter found</h1>
          <p className="text-gray-700">Join or create a shelter to manage pets.</p>
          <a href="/dashboard/shelter" className="mt-4 inline-block rounded-xl border px-4 py-2 hover:bg-emerald-50">
            Back to Shelter
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pets · {shelter.name}</h1>
        <a
          href={`/pets/new?shelter=${shelter._id}`}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
        >
          Add Pet
        </a>
      </div>

      <nav className="flex gap-2 text-sm">
        <a className="rounded-lg border px-3 py-1.5 hover:bg-emerald-50" href="/dashboard/shelter">Overview</a>
        <span className="rounded-lg border px-3 py-1.5 bg-emerald-50">Pets</span>
        <a className="rounded-lg border px-3 py-1.5 hover:bg-emerald-50" href="/dashboard/shelter/requests">Requests</a>
      </nav>

      {/* Client list (shelter-only) */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div suppressHydrationWarning>
          <ShelterPetsClient shelterId={String(shelter._id)} />
        </div>
      </section>
    </main>
  );
}

// Lazy client import to keep this file server-only
import dynamic from "next/dynamic";
const ShelterPetsClient = dynamic(() => import("./ShelterPets.client"), { ssr: false });
