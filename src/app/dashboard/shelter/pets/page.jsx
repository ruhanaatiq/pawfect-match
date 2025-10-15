import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function absoluteUrl(path = "/") {
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host  = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return new URL(path, `${proto}://${host}`).toString();
}

function qs(obj) {
  const u = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") u.set(k, String(v));
  });
  return u.toString();
}

function normalizeCover(p) {
  if (Array.isArray(p.images) && p.images.length) return p.images[0];
  if (typeof p.images === "string" && p.images) return p.images;
  if (Array.isArray(p.photos) && p.photos.length) return p.photos[0];
  if (typeof p.photos === "string" && p.photos) return p.photos;
  return "/placeholder-pet.jpg";
}

async function getMyShelter() {
  const cookie = headers().get("cookie") ?? "";
  const res = await fetch(absoluteUrl("/api/shelters/mine"), {
    cache: "no-store",
    headers: { cookie },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load shelter (${res.status})`);
  const data = await res.json();
  return data?.shelter ?? data;
}

/* Owner-scoped listing */
async function getMyPets({ page = 1, species = "", vaccinated = "" }) {
  const cookie = headers().get("cookie") ?? "";
  const url = absoluteUrl(
    `/api/shelters/mine/pets?${qs({
      page,
      species,
      ...(vaccinated ? { vaccinated } : {}),
    })}`
  );
  const res = await fetch(url, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return { items: [], total: 0, page, pageSize: 12 };
  return res.json();
}

export default async function ShelterPetsDashboard({ searchParams }) {
  const page = Math.max(1, Number(searchParams?.page || 1) || 1);
  const species = (searchParams?.species || "").toString();
  const vaccinated = (searchParams?.vaccinated || "").toString();

  const shelter = await getMyShelter();
  if (!shelter) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">No shelter found</h1>
        <p className="text-sm text-gray-600 mt-2">Create your shelter profile first.</p>
        <Link href="/dashboard/shelter" className="mt-3 inline-block rounded-lg bg-emerald-600 text-white px-3 py-2">
          Go to Shelter Overview
        </Link>
      </div>
    );
  }

  const { items: pets = [], total, pageSize = 12 } = await getMyPets({ page, species, vaccinated });
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Shelter Pets</h1>
        <Link href="/dashboard/shelter/pets/new" className="rounded-xl bg-emerald-600 text-white px-3 py-2">
          + Add Pet
        </Link>
      </div>

      {/* Filters */}
      <form action="/dashboard/shelter/pets" className="flex gap-2">
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

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
            You don’t have any pets yet.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Page {page} / {totalPages}</span>
          <div className="flex gap-2">
            <Link
              className={`rounded border px-3 py-1 ${page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
              href={`/dashboard/shelter/pets?${qs({ species, vaccinated, page: page - 1 })}`}
            >
              Prev
            </Link>
            <Link
              className={`rounded border px-3 py-1 ${page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
              href={`/dashboard/shelter/pets?${qs({ species, vaccinated, page: page + 1 })}`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
