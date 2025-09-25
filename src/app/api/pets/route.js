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
