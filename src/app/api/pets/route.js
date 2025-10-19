// src/app/api/pets/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs"; // MongoDB needs Node runtime

// Normalize a doc for public/admin UI
function shape(doc) {
  const imagesArr = Array.isArray(doc.images)
    ? doc.images.filter(Boolean)
    : typeof doc.images === "string" && doc.images
    ? [doc.images]
    : [];

  const image =
    imagesArr[0] ||
    doc.image || // single image fallback from older writers
    "/placeholder-pet.jpg";

  return {
    id: String(doc._id),
    name: doc.petName ?? doc.name ?? "Friend",
    species: doc.species ?? doc.petCategory ?? "",
    breed: doc.breed ?? "",
    age: doc.petAge ?? doc.age ?? "",
    gender: doc.gender ?? "",
    size: doc.size ?? "",
    status: doc.status ?? "available",
    // ✅ fields your public card reads:
    image,                                   // main image
    images: imagesArr.length ? imagesArr : [image],
    temperament: doc.temperament ?? "",
    description: doc.longDescription ?? doc.description ?? "",
    // optional location passthrough
    petLocation: doc.petLocation ?? null,    // e.g., { city, area, ... }
    createdAt: doc.createdAt ?? null,
  };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const arrify = (v) =>
  !v ? [] : Array.isArray(v) ? v.filter(Boolean) : String(v).split(",").map(s => s.trim()).filter(Boolean);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // paging (support both pageSize and limit)
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const rawPageSize = Number(searchParams.get("pageSize") ?? searchParams.get("limit") ?? 10);
    const pageSize = Math.min(100, Math.max(1, rawPageSize));

    // filters
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status"); // "all" | available | pending | adopted | inactive
    const species = searchParams.get("species")?.trim(); // <-- added
    const breeds = arrify(searchParams.get("breeds"));    // optional multi-breed filter

    const filter = {};

    if (status && status !== "all") filter.status = status;
    if (species) filter.$or = [
      { species },
      { petCategory: species },
    ];
    if (breeds.length) filter.breed = { $in: breeds };

    // text search across common fields (+ location)
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" };
      // merge with prior $or if species already set one
      filter.$or = (filter.$or || []).concat([
        { petName: rx }, { name: rx },
        { breed: rx }, { species: rx }, { petCategory: rx },
        { description: rx }, { longDescription: rx }, { temperament: rx },
        { "petLocation.city": rx }, { "petLocation.area": rx },
      ]);
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

    // small public cache; tweak as you like
    const res = NextResponse.json({ items, total, page, pageSize });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch (error) {
    console.error("GET /api/pets error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch pets" },
      { status: 500 }
    );
  }
}

function normalizeImages(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === "string") {
    return input.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function POST(req) {
  try {
    const body = await req.json();

    const now = new Date();
    const doc = {
      name: body.petName ?? body.name ?? "Friend",
      petName: body.petName ?? body.name ?? "Friend",
      species: body.species ?? body.petCategory ?? "",
      petCategory: body.petCategory ?? body.species ?? "",
      breed: body.breed ?? "",
      age: body.petAge ?? body.age ?? null,
      petAge: body.petAge ?? body.age ?? null,
      gender: body.gender ?? "",
      size: body.size ?? "",
      status: body.status ?? "available",
      images: normalizeImages(body.images ?? body.image),
      image: body.image ?? null, // allow older single-image writers
      petLocation: body.petLocation ?? body.location ?? null,
      temperament: body.temperament ?? "",
      longDescription: body.longDescription ?? body.description ?? "",
      createdAt: now,
      updatedAt: now,
    };
    if (!doc.images.length && doc.image) doc.images = [doc.image];
    if (!doc.images.length) doc.images = ["/placeholder-pet.jpg"];

    const pets = await getCollection("pets");
    const { insertedId } = await pets.insertOne(doc);
    const created = await pets.findOne({ _id: insertedId });

    return NextResponse.json(
      { item: created ? shape(created) : null },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/pets error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create pet" },
      { status: 500 }
    );
  }
}
