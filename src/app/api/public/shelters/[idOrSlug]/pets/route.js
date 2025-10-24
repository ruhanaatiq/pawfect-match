import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const revalidate = 60;

function shape(doc) {
  const imagesArr = Array.isArray(doc.images)
    ? doc.images.filter(Boolean)
    : typeof doc.images === "string" && doc.images
    ? [doc.images]
    : [];
  const image = imagesArr[0] || doc.image || "/pet-placeholder.jpg";

  return {
    id: String(doc._id),
    name: doc.petName ?? doc.name ?? "Friend",
    species: doc.species ?? doc.petCategory ?? "",
    breed: doc.breed ?? "",
    age: doc.petAge ?? doc.age ?? "",
    gender: doc.gender ?? "",
    size: doc.size ?? "",
    status: doc.status ?? "available",
    image,
    images: imagesArr.length ? imagesArr : [image],
    temperament: doc.temperament ?? "",
    description: doc.longDescription ?? doc.description ?? "",
    petLocation: doc.petLocation ?? null,
    createdAt: doc.createdAt ?? null,
    vaccinated: Boolean(doc.vaccinated),
  };
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req, { params }) {
  try {
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limitRaw = Number(url.searchParams.get("limit") || 12);
    const limit = Math.min(50, Math.max(1, limitRaw));
    const skip = (page - 1) * limit;

    const q = (url.searchParams.get("q") || "").trim();
    const species = (url.searchParams.get("species") || "").trim();
    const vaccinatedParam = (url.searchParams.get("vaccinated") || "").toLowerCase();
    const adoptableParam = (url.searchParams.get("adoptable") || "true").toLowerCase();

    const shelters = await getCollection("shelters");
    const pets = await getCollection("pets");

    // Resolve shelter by id OR slug
    const key = params.idOrSlug;
    let shelter = null;
    if (ObjectId.isValid(key)) {
      shelter = await shelters.findOne({ _id: new ObjectId(key) });
      if (!shelter) shelter = await shelters.findOne({ slug: key });
    } else {
      shelter = await shelters.findOne({ slug: key });
    }
    if (!shelter) {
      return NextResponse.json({ error: "Shelter not found" }, { status: 404 });
    }

    // Build filter
    const filter = {
      $or: [
        { shelterId: new ObjectId(shelter._id) },
        { ownerId: new ObjectId(shelter._id) },
      ],
    };

    // adoptable=true (default) => only "available"
    if (["true", "1", "yes"].includes(adoptableParam)) {
      filter.status = "available";
    } else if (["false", "0", "no"].includes(adoptableParam)) {
      filter.status = { $ne: "available" };
    } // "any" => no status filter

    if (species) {
      filter.$and = (filter.$and || []).concat([
        { $or: [{ species }, { petCategory: species }] },
      ]);
    }

    if (vaccinatedParam) {
      const val = ["true", "1", "yes"].includes(vaccinatedParam);
      filter.vaccinated = val;
    }

    if (q) {
      const rx = { $regex: esc(q), $options: "i" };
      filter.$and = (filter.$and || []).concat([{
        $or: [
          { petName: rx }, { name: rx }, { breed: rx },
          { species: rx }, { petCategory: rx },
          { description: rx }, { longDescription: rx }, { temperament: rx },
          { "petLocation.city": rx }, { "petLocation.area": rx },
        ],
      }]);
    }

    const total = await pets.countDocuments(filter);
    const docs = await pets.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
    const items = docs.map(shape);

    const res = NextResponse.json({
      shelter: { id: String(shelter._id), name: shelter.name ?? "" },
      items,
      page,
      pageSize: limit,
      total,
    });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch (e) {
    console.error("GET /api/public/shelters/[idOrSlug]/pets error:", e);
    return NextResponse.json({ error: "Failed to fetch shelter pets" }, { status: 500 });
  }
}
