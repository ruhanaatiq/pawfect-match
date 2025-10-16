import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import Pet from "@/models/Pets";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserId(session) {
  return session?.user?.id || session?.user?._id || session?.user?.sub || null;
}
function asOwnerId(id) {
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id;
}
function toStr(v) {
  return typeof v === "string" ? v.trim() : v ?? "";
}
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req) {
  try {
    const session = await auth();
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the owner’s shelter
    const shelter = await Shelter.findOne({ ownerId: asOwnerId(userId) })
      .select("_id")
      .lean();
    if (!shelter) {
      return NextResponse.json({ error: "Shelter not found" }, { status: 404 });
    }

    const body = await req.json();

    // Minimal validation
    const name = toStr(body?.name);
    const species = toStr(body?.species);
    if (!name || !species) {
      return NextResponse.json({ error: "Name and species are required" }, { status: 400 });
    }

    // Normalize images
    const imagesArray = Array.isArray(body?.images)
      ? body.images
      : typeof body?.images === "string"
      ? body.images.split(",")
      : [];
    const images = imagesArray
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);

    const petDoc = await Pet.create({
      shelterId: shelter._id,               // link to shelter
      name,
      species,
      breed: toStr(body?.breed),
      gender: toStr(body?.gender),
      size: toStr(body?.size),
      age: toNum(body?.age),                // number (months/years per your schema)
      vaccinated: !!body?.vaccinated,
      images,
      // Pick one and stick to it across UI:
      description: toStr(body?.description || body?.longDescription),
      // longDescription: toStr(body?.description || body?.longDescription),
    });

    const res = NextResponse.json(
      { ok: true, pet: { ...petDoc.toObject(), _id: String(petDoc._id) } },
      { status: 201 }
    );
    res.headers.set("Location", `/pets/${String(petDoc._id)}`);
    return res;
  } catch (err) {
    console.error("POST /api/shelters/mine/pets failed:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
