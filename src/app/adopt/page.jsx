// src/app/adopt/page.jsx
import PetsGrid from "./ui/PetsGrid";
import Filters from "./ui/Filters";
import Toolbar from "./ui/Toolbar";

import { connectDB } from "@/lib/mongoose";
import Pet from "@/models/Pets"; // ensure the default export matches file name


function arrify(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  // comma-separated -> array
  return String(v)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function iRegex(val) {
  // escape regex specials
  const safe = val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { $regex: safe, $options: "i" };
}

// Adapt DB doc to UI shape used by PetsGrid/PetCard
function shapePet(p) {
  const img = Array.isArray(p.images)
    ? p.images[0] || "/placeholder-pet.jpg"
    : p.images || "/placeholder-pet.jpg";

  const tags = [];
  if (p.vaccinationStatus) tags.push(String(p.vaccinationStatus)); // e.g., "Fully vaccinated"
  if (p.healthCondition) tags.push(String(p.healthCondition));      // e.g., "Healthy, Neutered"
  if (p.temperament) tags.push("Temperament: " + String(p.temperament));

  return {
    id: String(p._id),
    name: p.petName || p.name || "Unnamed Friend",
    species: p.species || p.petCategory || "",
    breed: p.breed || "",
    age: p.petAge || p.age || "",
    gender: p.gender || "",
    size: p.size || "",
    image: img,
    tags,
    shelter:
      (p.shelterInfo && typeof p.shelterInfo === "object" && p.shelterInfo.name)
        ? p.shelterInfo.name
        : (p.shelterInfo || "Shelter"),
    distanceKm: p.distanceKm ?? null,
  };
}

// --- page ----------------------------------------------------
export default async function AdoptPage({ searchParams }) {
  await connectDB();

  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = Math.max(1, Number(searchParams.pageSize || 12));

  const query = {};

  // text search
  if (searchParams.q) {
    const q = String(searchParams.q);
    query.$or = [
      { petName: { $regex: q, $options: "i" } },
      { breed: { $regex: q, $options: "i" } },
      { species: { $regex: q, $options: "i" } },
      // if petLocation is an object, remove this next line or target a field inside it
      // { petLocation: { $regex: q, $options: "i" } },
      { "shelterInfo.name": { $regex: q, $options: "i" } },
    ];
  }

  // basic filters
  if (searchParams.species) query.species = searchParams.species;
  if (searchParams.gender)  query.gender  = searchParams.gender;
  if (searchParams.size)    query.size    = searchParams.size;
  if (searchParams.age)     query.petAge  = searchParams.age;

  // ✅ vaccinationStatus (strings like "Fully vaccinated", "Partially vaccinated", etc.)
  // supports: ?vax=Fully vaccinated OR ?vax=Fully vaccinated&vax=Partially vaccinated OR ?vax=Fully vaccinated,Partially vaccinated
  const vaxValues = arrify(searchParams.vax);
  if (vaxValues.length === 1) {
    query.vaccinationStatus = iRegex(vaxValues[0]);
  } else if (vaxValues.length > 1) {
    query.$and = (query.$and || []).concat({
      $or: vaxValues.map(v => ({ vaccinationStatus: iRegex(v) })),
    });
  }

  // ✅ healthCondition (e.g., "Healthy, Neutered")
  // supports same forms: ?health=Healthy, Neutered OR multiple keys
  const healthValues = arrify(searchParams.health);
  if (healthValues.length === 1) {
    query.healthCondition = iRegex(healthValues[0]);
  } else if (healthValues.length > 1) {
    query.$and = (query.$and || []).concat({
      $or: healthValues.map(h => ({ healthCondition: iRegex(h) })),
    });
  }

  // example: temperament contains "calm"
  if (searchParams.temperament) {
    query.temperament = iRegex(String(searchParams.temperament));
  }

  // sort
  const sortKey = String(searchParams.sort || "recent");
  const sortMap = {
    recent:   { createdAt: -1 },
    youngest: { ageMonths: 1, createdAt: -1 },
    // implement geo sort separately if you have coords
    distance: { createdAt: -1 },
  };
  const sort = sortMap[sortKey] || sortMap.recent;

  const total = await Pet.countDocuments(query);
  const raw = await Pet.find(query)
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const items = raw.map(shapePet);
  const data = { total, page, pageSize, items };

  return (
    <main className="py-8">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#4C3D3D]">Adopt a Friend</h1>
          <p className="text-[#4C3D3D]/70">Browse pets from verified shelters and fosters.</p>
        </header>

        <Toolbar total={data.total} />

        <div className="mt-6 mb-6">
          <Filters />
        </div>

        <PetsGrid data={data} />
      </div>
    </main>
  );
}
