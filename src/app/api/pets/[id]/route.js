// app/api/pets/[id]/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badId() {
  return NextResponse.json({ success: false, error: "Invalid pet ID" }, { status: 400 });
}
function notFound() {
  return NextResponse.json({ success: false, error: "Pet not found" }, { status: 404 });
}
function serverErr(msg) {
  return NextResponse.json({ success: false, error: msg || "Server error" }, { status: 500 });
}

/* GET /api/pets/:id */
export async function GET(_req, { params }) {
  try {
    const { id } = params;                    // <-- no await
    if (!ObjectId.isValid(id)) return badId();

    const pets = await getCollection("pets");
    const pet = await pets.findOne({ _id: new ObjectId(id) });
    if (!pet) return notFound();

    return NextResponse.json({ success: true, data: { ...pet, _id: String(pet._id) } });
  } catch (e) {
    console.error("GET pet error:", e);
    return serverErr("Failed to fetch pet details");
  }
}

/* shared update function for PUT/PATCH */
async function updatePet(request, params) {
  const { id } = params;
  if (!ObjectId.isValid(id)) return badId();

  const body = await request.json().catch(() => ({}));
  delete body._id; // never allow _id update

  const pets = await getCollection("pets");
  const result = await pets.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...body, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) return notFound();
  return NextResponse.json({ success: true, message: "Pet updated successfully" });
}

/* PUT /api/pets/:id */
export async function PUT(request, ctx) {
  try {
    return await updatePet(request, ctx.params);
  } catch (e) {
    console.error("PUT pet error:", e);
    return serverErr("Failed to update pet");
  }
}

/* PATCH /api/pets/:id */
export async function PATCH(request, ctx) {
  try {
    return await updatePet(request, ctx.params);
  } catch (e) {
    console.error("PATCH pet error:", e);
    return serverErr("Failed to update pet");
  }
}

/* DELETE /api/pets/:id */
export async function DELETE(_req, { params }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) return badId();

    const pets = await getCollection("pets");
    const r = await pets.deleteOne({ _id: new ObjectId(id) });
    if (r.deletedCount === 0) return notFound();

    return NextResponse.json({ success: true, message: "Pet deleted successfully" });
  } catch (e) {
    console.error("DELETE pet error:", e);
    return serverErr("Failed to delete pet");
  }
}
