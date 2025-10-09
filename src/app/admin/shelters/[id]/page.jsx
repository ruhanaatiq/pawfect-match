// src/app/dashboard/shelter/page.jsx
import EditMyShelterForm from "./EditShelterForm.client";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function absoluteUrl(path="/") {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return new URL(path, env).toString();
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host  = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return new URL(path, `${proto}://${host}`).toString();
}

async function getMyShelter() {
  const url = absoluteUrl("/api/shelters/mine");
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load shelter (${res.status})`);
  const data = await res.json();
  return data?.shelter ?? data;
}

export default async function Page() {
  const shelter = await getMyShelter();
  if (!shelter) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="mb-2 text-2xl font-semibold">Your Shelter</h1>
          <p className="text-gray-700">You don’t have a shelter profile yet.</p>
          <div className="mt-4 flex gap-3">
            <a href="/dashboard/shelter/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              Create Shelter
            </a>
            <a href="/dashboard" className="rounded-xl border px-4 py-2 hover:bg-emerald-50">Back to Dashboard</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Edit Shelter</h1>
      <EditMyShelterForm shelter={shelter} />
    </main>
  );
}
