// src/app/api/pets/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function shape(doc) {
  const imagesArr = Array.isArray(doc.images) ? doc.images : (doc.images ? [doc.images] : []);
  const mainImage = imagesArr[0] || "/placeholder-pet.jpg";
  return {
    id: String(doc._id),
    name: doc.petName ?? doc.name ?? "Friend",
    species: doc.species ?? doc.petCategory ?? "",
    breed: doc.breed ?? "",
    age: doc.petAge ?? doc.age ?? null,
    gender: doc.gender ?? "",
    size: doc.size ?? "",
    location: doc.petLocation ?? null,
    temperament: doc.temperament ?? "",
    description: doc.longDescription ?? "",
    image: mainImage,
    images: imagesArr.length ? imagesArr : [mainImage],
    createdAt: doc.createdAt ?? null,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const skip = (page - 1) * pageSize;

    // filters
    const q = (searchParams.get("q") || "").trim();
    const species = (searchParams.get("species") || "").trim();
    const gender = (searchParams.get("gender") || "").trim();
    const ageMin = parseInt(searchParams.get("ageMin") || "", 10);
    const ageMax = parseInt(searchParams.get("ageMax") || "", 10);

    const query = {};
    if (species) query.$or = [{ species }, { petCategory: species }];
    if (gender) query.gender = gender;

    if (!isNaN(ageMin) || !isNaN(ageMax)) {
      // adjust to your actual age storage type
      query.$and = [
        ...(query.$and || []),
        ...(isNaN(ageMin) ? [] : [{ age: { $gte: ageMin } }]),
        ...(isNaN(ageMax) ? [] : [{ age: { $lte: ageMax } }]),
      ];
    }

    if (q) {
      const regex = new RegExp(q, "i");
      query.$or = [
        ...(query.$or || []),
        { petName: regex },
        { name: regex },
        { breed: regex },
        { description: regex },
        { longDescription: regex },
        { species: regex },
        { petCategory: regex },
      ];
    }

    // sorting
    const sortKey = (searchParams.get("sort") || "recent").toLowerCase();
    const sort =
      sortKey === "name"
        ? { petName: 1, name: 1 }
        : sortKey === "oldest"
        ? { createdAt: 1, _id: 1 }
        : { createdAt: -1, _id: -1 }; // default: recent

    const pets = await getCollection("pets");

    // totals + query
    const total = await pets.countDocuments(query);
    const projection = {
      petName: 1,
      name: 1,
      species: 1,
      petCategory: 1,
      breed: 1,
      age: 1,
      petAge: 1,
      gender: 1,
      size: 1,
      images: 1,
      petLocation: 1,
      temperament: 1,
      longDescription: 1,
      createdAt: 1,
    };

    const docs = await pets
      .find(query, { projection })
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const items = docs.map(shape);

    // ✅ return AFTER building items (and keep data as a temporary alias)
    return NextResponse.json({
      success: true,
      page,
      pageSize,
      total,
      items,          // canonical
      data: items,    // temporary for older clients
      count: items.length,
    });
  } catch (error) {
    console.error("GET /api/pets error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch pets" },
      { status: 500 }
    );
  }
}
function normalizeImages(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === "string") {
    // support comma-separated string
    return input.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function POST(req) {
  try {
    const body = await req.json();

    // allow only known fields (extend as needed)
    const doc = {
      name: body.petName ?? body.name ?? "Friend",
      species: body.species ?? body.petCategory ?? "",
      breed: body.breed ?? "",
      age: body.petAge ?? body.age ?? null,         // keep your flexible age type
      gender: body.gender ?? "",
      size: body.size ?? "",
      images: normalizeImages(body.images ?? body.image), // accept `image` or `images`
      petLocation: body.petLocation ?? body.location ?? null,
      temperament: body.temperament ?? "",
      longDescription: body.longDescription ?? body.description ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // main image fallback
    if (!doc.images.length) doc.images = ["/placeholder-pet.jpg"];

    const pets = await getCollection("pets");
    const { insertedId } = await pets.insertOne(doc);

    const created = await pets.findOne({ _id: insertedId });
    return NextResponse.json({
      success: true,
      item: created ? { ...shape(created) } : null,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pets error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to create pet" }, { status: 500 });
  }
}