// app/api/pets/[id]/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- helpers ---------- */
const ALLOWED_STATUSES = new Set(["available", "pending", "adopted", "inactive"]);

const badId = () =>
  NextResponse.json({ success: false, error: "Invalid pet ID" }, { status: 400 });
const notFound = () =>
  NextResponse.json({ success: false, error: "Pet not found" }, { status: 404 });
const serverErr = (msg) =>
  NextResponse.json({ success: false, error: msg || "Server error" }, { status: 500 });

function normalizeImages(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === "string") {
    return input.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

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
    breed: doc.breed ?? doc.petBreed ?? "",
    age: doc.petAge ?? doc.age ?? "",
    gender: doc.gender ?? "",
    size: doc.size ?? "",
    status: doc.status ?? "available",
    image,
    images: imagesArr.length ? imagesArr : [image],
    temperament: doc.temperament ?? "",
    description: doc.longDescription ?? doc.description ?? "",
    petLocation: doc.petLocation ?? null,
    vaccinated: Boolean(doc.vaccinated),
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    shelterId: doc.shelterId ? String(doc.shelterId) : undefined,
    ownerId: doc.ownerId ? String(doc.ownerId) : undefined,
    slug: doc.slug || undefined,
  };
}

async function findByIdOrSlug(collectionName, idOrSlug) {
  const col = await getCollection(collectionName);
  if (ObjectId.isValid(idOrSlug)) {
    const byId = await col.findOne({ _id: new ObjectId(idOrSlug) });
    if (byId) return byId;
  }
  // fall back to slug
  return col.findOne({ slug: idOrSlug });
}

/* ---------- OPTIONS (CORS/preflight) ---------- */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Allow": "GET,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

/* ---------- GET /api/pets/:idOrSlug ---------- */
export async function GET(_req, { params }) {
  try {
    const idOrSlug = params.id;
    const pets = await getCollection("pets");

    let doc = null;
    if (ObjectId.isValid(idOrSlug)) {
      doc = await pets.findOne({ _id: new ObjectId(idOrSlug) });
      if (!doc) doc = await pets.findOne({ slug: idOrSlug });
    } else {
      doc = await pets.findOne({ slug: idOrSlug });
    }
    if (!doc) return notFound();

    const res = NextResponse.json({ success: true, item: shape(doc) });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    res.headers.set("Allow", "GET,PUT,PATCH,DELETE,OPTIONS");
    return res;
  } catch (e) {
    console.error("GET pet error:", e);
    return serverErr("Failed to fetch pet details");
  }
}

/* ---------- shared update ---------- */
async function updatePet(request, params) {
  const idOrSlug = params.id;
  const pets = await getCollection("pets");

  // resolve target first so we can accept slug or id
  let target = null;
  if (ObjectId.isValid(idOrSlug)) {
    target = await pets.findOne({ _id: new ObjectId(idOrSlug) });
    if (!target) target = await pets.findOne({ slug: idOrSlug });
  } else {
    target = await pets.findOne({ slug: idOrSlug });
  }
  if (!target) return notFound();

  const incoming = await request.json().catch(() => ({}));
  delete incoming._id; // never allow _id update

  // only allow known fields; ignore others
  const ALLOWED = new Set([
    "petName", "name",
    "species", "petCategory",
    "breed", "petBreed",
    "age", "petAge",
    "gender", "size", "status",
    "temperament", "longDescription", "description",
    "petLocation",
    "vaccinated",
    "images", "image",
    "slug",
  ]);

  const updates = {};
  for (const [k, v] of Object.entries(incoming)) {
    if (ALLOWED.has(k)) updates[k] = v;
  }

  // lightweight validation
  if ("status" in updates && updates.status && !ALLOWED_STATUSES.has(String(updates.status))) {
    return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
  }
  if ("vaccinated" in updates) {
    updates.vaccinated = Boolean(updates.vaccinated);
  }

  // normalize images
  if ("images" in updates || "image" in updates) {
    const imgs = normalizeImages(updates.images ?? updates.image);
    updates.images = imgs.length ? imgs : undefined;
    if (!updates.image && imgs.length) updates.image = imgs[0];
  }

  // keep aliases in sync
  if ("name" in updates && !("petName" in updates)) updates.petName = updates.name;
  if ("petName" in updates && !("name" in updates)) updates.name = updates.petName;
  if ("species" in updates && !("petCategory" in updates)) updates.petCategory = updates.species;
  if ("petCategory" in updates && !("species" in updates)) updates.species = updates.petCategory;
  if ("age" in updates && !("petAge" in updates)) updates.petAge = updates.age;
  if ("petAge" in updates && !("age" in updates)) updates.age = updates.petAge;
  if ("breed" in updates && !("petBreed" in updates)) updates.petBreed = updates.breed;
  if ("petBreed" in updates && !("breed" in updates)) updates.breed = updates.petBreed;

  const r = await pets.updateOne(
    { _id: target._id },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  if (r.matchedCount === 0) return notFound();

  const fresh = await pets.findOne({ _id: target._id });
  return NextResponse.json({
    success: true,
    item: fresh ? shape(fresh) : null,
    message: "Pet updated successfully",
  });
}

/* ---------- PUT /api/pets/:idOrSlug ---------- */
export async function PUT(request, ctx) {
  try {
    const res = await updatePet(request, ctx.params);
    res.headers.set("Allow", "GET,PUT,PATCH,DELETE,OPTIONS");
    return res;
  } catch (e) {
    console.error("PUT pet error:", e);
    return serverErr("Failed to update pet");
  }
}

/* ---------- PATCH /api/pets/:idOrSlug ---------- */
export async function PATCH(request, ctx) {
  try {
    const res = await updatePet(request, ctx.params);
    res.headers.set("Allow", "GET,PUT,PATCH,DELETE,OPTIONS");
    return res;
  } catch (e) {
    console.error("PATCH pet error:", e);
    return serverErr("Failed to update pet");
  }
}

/* ---------- DELETE /api/pets/:idOrSlug ---------- */
export async function DELETE(_req, { params }) {
  try {
    const idOrSlug = params.id;
    const pets = await getCollection("pets");

    // resolve by id or slug
    let target = null;
    if (ObjectId.isValid(idOrSlug)) {
      target = await pets.findOne({ _id: new ObjectId(idOrSlug) });
      if (!target) target = await pets.findOne({ slug: idOrSlug });
    } else {
      target = await pets.findOne({ slug: idOrSlug });
    }
    if (!target) return notFound();

    const r = await pets.deleteOne({ _id: target._id });
    if (r.deletedCount === 0) return notFound();

    return NextResponse.json({ success: true, message: "Pet deleted successfully" });
  } catch (e) {
    console.error("DELETE pet error:", e);
    return serverErr("Failed to delete pet");
  }
}
