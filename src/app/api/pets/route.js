// src/app/api/pets/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs"; // MongoDB needs Node runtime

// Normalize output to what the Admin table expects
function shape(doc) {
  const imagesArr = Array.isArray(doc.images)
    ? doc.images.filter(Boolean)
    : typeof doc.images === "string" && doc.images
    ? [doc.images]
    : [];

  const image =
    imagesArr[0] ||
    doc.image || // in case single field was used earlier
    "/placeholder-pet.jpg";

  return {
    id: String(doc._id),
    name: doc.petName ?? doc.name ?? "Friend",
    species: doc.species ?? doc.petCategory ?? "",
    breed: doc.breed ?? "",
    age: doc.petAge ?? doc.age ?? "",
    gender: doc.gender ?? "",
    size: doc.size ?? "",
    status: doc.status ?? "available", // default if not set yet
    image,                              // single main image (UI reads this first)
    images: imagesArr.length ? imagesArr : [image], // also provide an array (UI fallback)
    createdAt: doc.createdAt ?? null,
  };
}

function arrify(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  return String(v).split(",").map(s => s.trim()).filter(Boolean);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // paging
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSizeRaw = Number(searchParams.get("pageSize") || 10);
    const pageSize = Math.min(100, Math.max(1, pageSizeRaw));

    // filters
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status"); // "all" | available | pending | adopted | inactive

    const filter = {};

    // text search across common fields
    if (q) {
      const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      filter.$or = [
        { petName: rx }, { name: rx },
        { breed: rx }, { species: rx }, { petCategory: rx },
      ];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const pets = await getCollection("pets");

    const total = await pets.countDocuments(filter);

    const docs = await pets
      .find(filter)
      .sort({ createdAt: -1 }) // newest first
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const items = docs.map(shape);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
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
