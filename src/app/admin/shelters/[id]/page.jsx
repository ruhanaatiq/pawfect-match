// src/app/admin/shelters/[id]/page.jsx
export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import EditShelterForm from "./EditShelterForm.client";
import InvitesCard from "./InvitesCard.client";

function base() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function getShelter(id) {
  const h = headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${base()}/api/admin/shelters/${id}`, {
    cache: "no-store",
    headers: { cookie }, // ← forward cookies so requireAdmin() works
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load shelter (${res.status})`);
  const data = await res.json();
  return data?.shelter ?? data;
}

export default async function Page({ params, searchParams }) {
  const shelter = await getShelter(params.id);
  if (!shelter) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Shelter not found</h1>
        <a href="/admin/shelters" className="underline text-emerald-700">Back to list</a>
      </main>
    );
  }

  const tab = String(searchParams?.tab || "overview").toLowerCase();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin · {shelter.name}</h1>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-4">
        <a href={`?tab=overview`} className={`tab ${tab === "overview" ? "tab-active" : ""}`}>
          Overview
        </a>
        <a href={`?tab=invites`} className={`tab ${tab === "invites" ? "tab-active" : ""}`}>
          Invites
        </a>
      </div>

      {tab === "overview" && (
        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-4 text-lg font-medium">Edit Shelter</h2>
            <EditShelterForm shelter={shelter} />
          </div>
        </section>
      )}

      {tab === "invites" && (
        <section className="space-y-6">
          <InvitesCard shelterId={params.id} />
        </section>
      )}
    </main>
  );
}
