// src/app/shelters/[slug]/page.jsx
import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import Pet from "@/models/Pet"; // assume { name, photos[0], status, species, age, vaccinated, shelter }
import Reviews from "./Reviews"; // stub component (see below)

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { slug } = params;
  await connectDB();
  const s = await Shelter.findOne({ publicSlug: slug }).lean();
  if (!s) return { title: "Shelter not found" };
  return {
    title: `${s.name} – Pawfect Match`,
    description: s.address || "Find adoptable pets near you",
  };
}

export default async function ShelterPublic({ params, searchParams }) {
  const { slug } = params;
  await connectDB();
  const shelter = await Shelter.findOne({ publicSlug: slug }).lean();
  if (!shelter) return <div className="p-8 text-center">Shelter not found.</div>;

  const filters = {
    species: searchParams.species || "",
    vaccinated: searchParams.vaccinated || "",
  };
  const petFilter = { shelter: shelter._id, status: { $in: ["active", "listed"] } };
  if (filters.species) petFilter.species = filters.species;
  if (filters.vaccinated) petFilter.vaccinated = filters.vaccinated === "true";

  const pets = await Pet.find(petFilter).sort({ createdAt: -1 }).limit(24).lean();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Hero */}
      <section className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl overflow-hidden ring-1 ring-black/5 bg-white">
            {/* logo or fallback */}
            {shelter.logoUrl ? (
              <Image src={shelter.logoUrl} alt={shelter.name} width={64} height={64} />
            ) : (
              <div className="h-full w-full grid place-items-center text-xs text-gray-500">Logo</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#4C3D3D] flex items-center gap-2">
              {shelter.name}
              {shelter.status === "verified" ? (
                <span title="Verified" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  <svg width="14" height="14" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                  Verified
                </span>
              ) : null}
            </h1>
            <p className="text-sm text-gray-600">{shelter.address || "—"}</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {shelter.phone ? (
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href={`tel:${shelter.phone}`}>Call</a>
          ) : null}
          {shelter.email ? (
            <a className="rounded-xl border px-3 py-2 hover:bg-emerald-50" href={`mailto:${shelter.email}`}>Message</a>
          ) : null}
          <Link className="rounded-xl bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700" href="#adoptable">
            View Pets
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Highlight label="Active Listings" value={shelter.petsCount ?? "—"} />
        <Highlight label="Adoptions Processed" value={shelter.requestsCount ?? "—"} />
        <Highlight label="Members" value={shelter.membersCount ?? "—"} />
      </section>

      {/* About */}
      <section className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
        <h2 className="text-lg font-semibold text-[#4C3D3D]">About</h2>
        <p className="mt-1 text-sm text-gray-700">
          {/* replace with bio/description field if you have it */}
          We’re a community shelter focused on safe, responsible adoptions and post-adoption support.
        </p>
      </section>

      {/* Adoptable Pets + Filters */}
      <section id="adoptable" className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#4C3D3D]">Adoptable Pets</h2>
          <form className="flex gap-2">
            <select
              defaultValue={filters.species}
              name="species"
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="">All species</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="rabbit">Rabbit</option>
            </select>
            <select
              defaultValue={filters.vaccinated}
              name="vaccinated"
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="true">Vaccinated</option>
              <option value="false">Not vaccinated</option>
            </select>
            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-emerald-50">Filter</button>
          </form>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {pets.map((p) => (
            <Link key={String(p._id)} href={`/pets/${p._id}`} className="rounded-xl ring-1 ring-black/5 overflow-hidden bg-white hover:shadow">
              <div className="h-40 w-full bg-gray-100">
                {p.photos?.[0] ? (
                  <Image src={p.photos[0]} alt={p.name} width={600} height={320} className="h-40 w-full object-cover" />
                ) : null}
              </div>
              <div className="p-3">
                <div className="font-medium text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-600 capitalize">
                  {p.species} • {p.age || "Age N/A"} {p.vaccinated ? "• Vaccinated" : ""}
                </div>
              </div>
            </Link>
          ))}
          {!pets.length ? (
            <div className="sm:col-span-2 md:col-span-3 py-12 text-center text-gray-500 text-sm">No pets match your filters</div>
          ) : null}
        </div>
      </section>

      {/* Contact & Hours */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="font-semibold text-[#4C3D3D]">Contact</h3>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            <li><span className="text-gray-500">Phone:</span> {shelter.phone || "—"}</li>
            <li><span className="text-gray-500">Email:</span> {shelter.email || "—"}</li>
            <li><span className="text-gray-500">Address:</span> {shelter.address || "—"}</li>
            <li><span className="text-gray-500">Status:</span> {labelStatus(shelter.status)}</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="font-semibold text-[#4C3D3D]">Map</h3>
          <div className="mt-2 h-48 rounded-lg bg-emerald-50 grid place-items-center text-gray-500 text-sm">
            Map placeholder (embed later)
          </div>
        </div>
      </section>

      {/* Reviews */}
      <Reviews shelterId={String(shelter._id)} />
      
      {/* Policy & Support */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="font-semibold text-[#4C3D3D]">Adoption Policy</h3>
          <ul className="mt-2 text-sm list-disc ml-5 text-gray-700 space-y-1">
            <li>Application + home readiness check</li>
            <li>Vaccination & microchip prior to adoption</li>
            <li>Adoption fee covers basic medical care</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="font-semibold text-[#4C3D3D]">Support the Shelter</h3>
          <div className="mt-2 flex gap-2">
            <Link href={`/donate?shelter=${slug}`} className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm">Donate</Link>
            <Link href={`/volunteer?shelter=${slug}`} className="rounded-xl border px-4 py-2 text-sm">Volunteer</Link>
            <Link href={`/wishlist?shelter=${slug}`} className="rounded-xl border px-4 py-2 text-sm">Wishlist</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Highlight({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function labelStatus(s) {
  return s === "verified" ? "Verified" : s === "pending_review" ? "Pending review" : "Rejected";
}
