// src/app/shelters/[slug]/page.jsx
export const revalidate = 60;

import Link from "next/link";
import Image from "next/image";
import { absoluteUrl } from "@/lib/absolute-url";

/* ---------------- helpers ---------------- */
const qs = (obj) => {
  const u = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") u.set(k, String(v));
  });
  return u.toString();
};

function normalizeCover(p) {
  if (Array.isArray(p.images) && p.images.length) return p.images[0];
  if (typeof p.images === "string" && p.images) return p.images;
  if (Array.isArray(p.photos) && p.photos.length) return p.photos[0];
  if (typeof p.photos === "string" && p.photos) return p.photos;
  return "/placeholder-pet.jpg";
}

/* --------------- data fetchers --------------- */
async function fetchShelter(slugOrId) {
  const url = absoluteUrl(`/api/public/shelters/${encodeURIComponent(slugOrId)}`);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.shelter ?? null;
}

async function fetchShelterPets(shelterId, { page = 1, species = "", vaccinated = "" }) {
  // Always request adoptable pets for the public page
  const url = absoluteUrl(
    `/api/public/shelters/${encodeURIComponent(shelterId)}/pets?${qs({
      page,
      species,
      ...(vaccinated ? { vaccinated } : {}),
      adoptable: 1,
    })}`
  );
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return { items: [], total: 0, page, pageSize: 12 };
  return res.json();
}

/* --------------- metadata --------------- */
export async function generateMetadata({ params }) {
  const s = await fetchShelter(params.slug);
  if (!s) return { title: "Shelter not found" };
  return {
    title: `${s.name} – Pawfect Match`,
    description:
      s.address ||
      [s.location?.city, s.location?.state, s.location?.country].filter(Boolean).join(", ") ||
      "Find adoptable pets near you",
  };
}

/* --------------- page --------------- */
export default async function ShelterPublic({ params, searchParams }) {
  const slugOrId = params.slug;
  const species = (searchParams?.species || "").toString();
  const vaccinated = (searchParams?.vaccinated || "").toString(); // "", "true", "false"
  const page = Math.max(1, Number(searchParams?.page || 1) || 1);

  const shelter = await fetchShelter(slugOrId);
  if (!shelter) return <div className="p-8 text-center">Shelter not found.</div>;

  // Guaranteed id (covers _id/id or when slug == id)
  const shelterId = shelter._id || shelter.id || slugOrId;

  const { items: pets, total, pageSize } = await fetchShelterPets(shelterId, {
    page,
    species,
    vaccinated,
  });
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 12)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Hero */}
      <section className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl overflow-hidden ring-1 ring-black/5 bg-white">
            {shelter.logoUrl ? (
              <Image src={shelter.logoUrl} alt={shelter.name} width={64} height={64} unoptimized />
            ) : (
              <div className="h-full w-full grid place-items-center text-xs text-gray-500">Logo</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#4C3D3D] flex items-center gap-2">
              {shelter.name}
              {shelter.status === "verified" && (
                <span
                  title="Verified"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  Verified
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-600">
              {shelter.address ||
                [shelter.location?.city, shelter.location?.state, shelter.location?.country]
                  .filter(Boolean)
                  .join(", ") ||
                "—"}
            </p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {shelter.phone && (
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href={`tel:${shelter.phone}`}>
              Call
            </a>
          )}
          {shelter.email && (
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href={`mailto:${shelter.email}`}>
              Message
            </a>
          )}
          <Link className="rounded-xl bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700" href="#adoptable">
            View Pets
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Highlight label="Active Listings" value={total ?? "—"} />
        <Highlight label="Adoptions Processed" value={shelter.requestsCount ?? "—"} />
        <Highlight label="Members" value={shelter.membersCount ?? shelter.members?.length ?? "—"} />
      </section>

      {/* About */}
      <section className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
        <h2 className="text-lg font-semibold text-[#4C3D3D]">About</h2>
        <p className="mt-1 text-sm text-gray-700">
          {shelter.description ||
            "We’re a community shelter focused on safe, responsible adoptions and post-adoption support."}
        </p>
      </section>

      {/* Adoptable Pets */}
      <section id="adoptable" className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#4C3D3D]">Adoptable Pets</h2>

          <form action={`/shelters/${params.slug}`} className="flex gap-2">
            <select name="species" defaultValue={species} className="rounded-xl border px-3 py-2 text-sm">
              <option value="">All species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>
            <select name="vaccinated" defaultValue={vaccinated} className="rounded-xl border px-3 py-2 text-sm">
              <option value="">Any</option>
              <option value="true">Vaccinated</option>
              <option value="false">Not vaccinated</option>
            </select>
            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-emerald-50">Filter</button>
          </form>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {pets.map((p) => {
            const cover = normalizeCover(p);
            const title = p.name || p.petName || "Friend";
            const line =
              `${p.species || p.type || p.petType || "—"} • ${p.gender || "—"} • ${p.size || "—"}` +
              (p.vaccinated ? " • Vaccinated" : "");
            return (
              <Link
                key={String(p._id || p.id)}
                href={`/pets/${p._id || p.id}`}
                className="rounded-xl ring-1 ring-black/5 overflow-hidden bg-white hover:shadow"
              >
                <div className="h-40 w-full bg-gray-100">
                  {cover && (
                    <Image
                      src={cover}
                      alt={title}
                      width={600}
                      height={320}
                      className="h-40 w-full object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-gray-900">{title}</div>
                  <div className="text-xs text-gray-600">{line}</div>
                </div>
              </Link>
            );
          })}

          {!pets.length && (
            <div className="sm:col-span-2 md:col-span-3 py-12 text-center text-gray-500 text-sm">
              No pets match your filters
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Link
                className={`rounded border px-3 py-1 ${
                  page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"
                }`}
                href={`/shelters/${params.slug}?${qs({ species, vaccinated, page: page - 1 })}#adoptable`}
              >
                Prev
              </Link>
              <Link
                className={`rounded border px-3 py-1 ${
                  page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"
                }`}
                href={`/shelters/${params.slug}?${qs({ species, vaccinated, page: page + 1 })}#adoptable`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Contact & Map */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="font-semibold text-[#4C3D3D]">Contact</h3>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            <li><span className="text-gray-500">Phone:</span> {shelter.phone || "—"}</li>
            <li><span className="text-gray-500">Email:</span> {shelter.email || "—"}</li>
            <li>
              <span className="text-gray-500">Address:</span>{" "}
              {shelter.address ||
                [shelter.location?.city, shelter.location?.state, shelter.location?.country].filter(Boolean).join(", ") ||
                "—"}
            </li>
            <li>
              <span className="text-gray-500">Status:</span>{" "}
              {shelter.status === "verified" ? "Verified" : shelter.status || "—"}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="font-semibold text-[#4C3D3D]">Map</h3>
          <div className="mt-2 h-48 rounded-lg bg-emerald-50 grid place-items-center text-gray-500 text-sm">
            Map placeholder (embed later)
          </div>
        </div>
      </section>
    </div>
  );
}

/* --------------- bits --------------- */
function Highlight({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
