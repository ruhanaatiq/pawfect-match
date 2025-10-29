// src/app/api/pets/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs"; // MongoDB needs Node runtime

/* --- helpers you can place top-level --- */
function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function toSingularMaybe(s){ return s.replace(/s$/i, ""); }

function shape(doc) {
  const imgs = Array.isArray(doc.images) ? doc.images.filter(Boolean)
              : typeof doc.images === "string" && doc.images ? [doc.images] : [];
  const image = imgs[0] || doc.image || "/pet-placeholder.jpg";
  return {
    id: String(doc._id),
    name: doc.petName ?? doc.name ?? "Friend",
    species: doc.species ?? doc.petCategory ?? "",
    breed: doc.breed ?? doc.petBreed ?? doc.breedName ?? "",
    age: doc.petAge ?? doc.age ?? "",
    gender: doc.gender ?? "",
    size: doc.size ?? "",
    status: doc.status ?? "available",
    image,
    images: imgs.length ? imgs : [image],
    createdAt: doc.createdAt ?? null,
  };
}

/* --- GET /api/pets --- */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // paging
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 10)));

    // filters
    const q        = searchParams.get("q")?.trim();
    const status   = searchParams.get("status")?.trim(); // "available" | "pending" | "adopted" | "inactive"
    const speciesQ = searchParams.get("species")?.trim(); // e.g. "Cats"

    const filter = {};

    // text search across common fields
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [
        { petName: rx }, { name: rx },
        { breed: rx }, { petBreed: rx }, { breedName: rx },
        { species: rx }, { petCategory: rx },
      ];
    }

    // tolerant species filter: plural/singular, case-insensitive, species OR petCategory
    if (speciesQ) {
      const singular = toSingularMaybe(speciesQ);
      const exact = (v) => ({ $regex: `^${escapeRegex(v)}$`, $options: "i" });

      // if there is already an $or (from q), append; else create
      const speciesOr = [
        { species:     exact(speciesQ) },
        { petCategory: exact(speciesQ) },
        { species:     exact(singular) },
        { petCategory: exact(singular) },
      ];
      if (filter.$or) filter.$or = filter.$or.concat(speciesOr);
      else filter.$or = speciesOr;
    }

    // status filter (tolerant but exact values)
    if (status && status !== "all") {
      filter.status = { $regex: `^${escapeRegex(status)}$`, $options: "i" };
    }

    const pets = await getCollection("pets");

    const total = await pets.countDocuments(filter);
    const docs = await pets
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const items = docs.map(shape);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (err) {
    console.error("GET /api/pets error:", err);
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 });
  }
}
function normalizeImages(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === "string") return input.split(",").map(s => s.trim()).filter(Boolean);
  return [];
}

const ALLOWED_STATUSES = new Set(["available", "pending", "adopted", "inactive"]);

/* --- POST /api/pets  (create) --- */
export async function POST(req) {
  try {
    const body = await req.json();

    // map your NewPetPage payload -> DB doc
    const imgs = normalizeImages(body.images);
    const doc = {
      name: body?.name ?? "",
      petName: body?.name ?? "",

      species: body?.species ?? "Other",
      petCategory: body?.species ?? "Other",

      breed: body?.breed ?? "",
      petBreed: body?.breed ?? "",

      age: Number(body?.age ?? 0),
      petAge: Number(body?.age ?? 0),

      gender: body?.gender ?? "Unknown",
      size: body?.size ?? "Medium",

      status: ALLOWED_STATUSES.has(String(body?.status)) ? body.status : "available",

      longDescription: body?.longDescription ?? body?.description ?? "",
      description: body?.description ?? undefined,

      vaccinated: !!body?.vaccinated,
      spayedNeutered: !!body?.spayedNeutered,
      goodWithKids: !!body?.goodWithKids,

      tags: Array.isArray(body?.tags) ? body.tags : [],

      petLocation: body?.petLocation ?? "",
      shelter: body?.shelter ?? "",
      ...(typeof body?.distanceKm === "number" ? { distanceKm: body.distanceKm } : {}),

      images: imgs,
      image: imgs[0] || undefined,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const pets = await getCollection("pets");
    const { insertedId } = await pets.insertOne(doc);
    const created = await pets.findOne({ _id: insertedId });

    return NextResponse.json(
      { success: true, item: shape(created), id: insertedId, message: "created" },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/pets error:", err);
    return NextResponse.json({ success: false, error: "Failed to create pet" }, { status: 500 });
  }
}

/* --- OPTIONS (preflight/CORS, optional) --- */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET,POST,OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
