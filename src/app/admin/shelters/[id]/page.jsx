import { notFound } from "next/navigation";
import { headers } from "next/headers";
import EditShelterForm from "./EditShelterForm.client";

export const dynamic = "force-dynamic";

// Keep sync (no async/await here)
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

  const hdrs = headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  return host ? `${proto}://${host}` : "";
}

async function getShelter(id) {
  const base = getBaseUrl();              // string, not Promise
  const res  = await fetch(`${base}/api/shelters/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();          // ✅ IMPORTANT
  return data.shelter ?? data;            // works for either shape
}

export default async function Page({ params }) {
  const { id } = params;                  // ❌ no await
  const shelter = await getShelter(id);
  if (!shelter) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Edit Shelter</h1>
      <EditShelterForm id={id} shelter={shelter} />
    </main>
  );
}
