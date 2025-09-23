// src/app/adopt/page.jsx
import PetsGrid from "./ui/PetsGrid";
import Filters from "./ui/Filters";
import Toolbar from "./ui/Toolbar";

import { connectDB } from "@/lib/mongoose";
import Pet from "@/models/Pets"; // <- singular file: src/models/Pet.js

// Helper: turn your DB doc into the shape PetsGrid/PetCard expects
function shapePet(p) {
  // images may be string or array
  const img = Array.isArray(p.images) ? (p.images[0] || "/placeholder-pet.jpg") : (p.images || "/placeholder-pet.jpg");

  // build tags from your booleans/strings
  const tags = []
  if (p.vaccinationStatus === true || p.vaccinationStatus === "Vaccinated") tags.push("Vaccinated");
  if (p.healthCondition && typeof p.healthCondition === "string") tags.push(p.healthCondition);
  if (p.temperament && typeof p.temperament === "string") tags.push("Good temperament");

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
    shelter: (typeof p.shelterInfo === "object" && p.shelterInfo?.name) ? p.shelterInfo.name : (p.shelterInfo || "Shelter"),
    distanceKm: p.distanceKm ?? null, // if you compute this elsewhere
  };
}

export default async function AdoptPage({ searchParams }) {
  await connectDB();

  // paging
  const page = Number(searchParams.page || 1);
  const pageSize = Number(searchParams.pageSize || 12);

  // build query from your filters
  const query = {};
  if (searchParams.q) {
    // simple case-insensitive match across key fields
    const q = String(searchParams.q);
    query.$or = [
      { petName: { $regex: q, $options: "i" } },
      { breed: { $regex: q, $options: "i" } },
      { species: { $regex: q, $options: "i" } },
      { petLocation: { $regex: q, $options: "i" } },
      { shelterInfo: { $regex: q, $options: "i" } },
    ];
  }
  if (searchParams.species) query.species = searchParams.species;
  if (searchParams.gender)  query.gender  = searchParams.gender;
  if (searchParams.size)    query.size    = searchParams.size;
  if (searchParams.age)     query.petAge  = searchParams.age; // adjust if you store bands like "Puppy/Kitten"

  if (searchParams.vax)  query.vaccinationStatus = { $in: [true, "Vaccinated"] };
  if (searchParams.spay) query.spayedNeutered    = true;
  if (searchParams.good) query.temperament       = { $regex: "good", $options: "i" }; // tweak to your data

  // sort mapping
  const sortKey = String(searchParams.sort || "recent");
  const sortMap = {
    recent:   { createdAt: -1 },
    youngest: { ageMonths: 1, createdAt: -1 }, // if you store ageMonths
    distance: { createdAt: -1 }, // real distance needs geo pipeline; handled elsewhere
  };
  const sort = sortMap[sortKey] || sortMap.recent;

  const total = await Pet.countDocuments(query);
  const raw = await Pet.find(query)
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean(); // plain objects (but _id is still ObjectId)

  // serialize & map to UI shape
  const items = raw.map(shapePet);
  const data = { total, page, pageSize, items };

  return (
    <main className="py-8">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-6 ">
          <h1 className="text-3xl font-extrabold text-[#4C3D3D]">Adopt a Friend</h1>
          <p className="text-[#4C3D3D]/70">Browse pets from verified shelters and fosters.</p>
        </header>

        {/* results summary / sort / view toggle */}
        <Toolbar total={data.total} />

        {/* horizontal filters bar */}
        <div className="mt-6 mb-6">
          <Filters />
        </div>

        {/* pet cards + internal pagination */}
        <PetsGrid data={data} />
      </div>
    </main>
  );
}
