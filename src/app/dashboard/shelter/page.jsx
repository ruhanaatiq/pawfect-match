// src/app/dashboard/shelter/page.jsx
import { getMyShelter } from "./_server";
import EditMyShelterForm from "./EditMyShelterForm.client"; // keep your client form

export const dynamic = "force-dynamic";

export default async function ShelterOverview() {
  const shelter = await getMyShelter();

  if (!shelter) {
    return (
      <main>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-semibold mb-2">No shelter found for your account</h1>
          <p className="text-gray-700">
            Ask an owner/manager to invite you — or create a shelter if you’re the owner.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/dashboard/shelter/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              Add Shelter
            </a>
            <a href="/invite" className="rounded-xl border px-4 py-2 hover:bg-emerald-50">
              I have an invite link
            </a>
            <a href="/dashboard" className="rounded-xl border px-4 py-2 hover:bg-emerald-50">
              Back to Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  const myRole = (shelter.myRole || "").toLowerCase();
  const canInvite = ["owner", "manager"].includes(myRole);

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">
          {shelter.name ? `Shelter · ${shelter.name}` : "Your Shelter"}
        </h1>
        <div className="flex gap-2">
          {canInvite && shelter._id && (
            <a
              href={`/admin/shelters/${shelter._id}?tab=invites`}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
            >
              Invite / Manage Staff
            </a>
          )}
        </div>
      </div>

      {/* Quick nav */}
      <nav className="flex gap-2 text-sm">
        <a className="rounded-lg border px-3 py-1.5 bg-emerald-50">Overview</a>
        <a className="rounded-lg border px-3 py-1.5 hover:bg-emerald-50" href="/dashboard/shelter/pets">Pets</a>
        <a className="rounded-lg border px-3 py-1.5 hover:bg-emerald-50" href="/dashboard/shelter/requests">Requests</a>
      </nav>

      {/* Edit form */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-medium mb-4">Edit Shelter</h2>
        <EditMyShelterForm shelter={shelter} />
      </section>
    </main>
  );
}
