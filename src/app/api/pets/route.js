// src/app/api/pets/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs"; // important: mongodb needs Node runtime

function shape(doc) {
  return {
    id: String(doc._id), // serialize ObjectId
    petName: doc.petName ?? doc.name ?? "Friend",
    species: doc.species ?? doc.petCategory ?? "",
    breed: doc.breed ?? "",
    petAge: doc.petAge ?? doc.age ?? "",
    gender: doc.gender ?? "",
    size: doc.size ?? "",
    images: Array.isArray(doc.images)
      ? doc.images[0] || "/placeholder-pet.jpg"
      : doc.images || "/placeholder-pet.jpg",
    petLocation: doc.petLocation ?? null,
    temperament: doc.temperament ?? "",
    longDescription: doc.longDescription ?? "",
  };
}

export async function GET() {
  try {
    const petsCollection = await getCollection("pets");
    const docs = await petsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const items = docs.map(shape);

    return NextResponse.json({
      success: true,
      data: items,
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