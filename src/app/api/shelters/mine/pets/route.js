import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import Pet from "@/models/Pets"; // or "@/models/Pet"
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserId(session) {
  return session?.user?.id || session?.user?._id || session?.user?.sub || null;
}

function asOwnerId(id) {
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id;
}

export async function POST(req) {
  try {
    const session = await auth();
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // find the owner’s shelter
    const shelter = await Shelter.findOne({ ownerId: asOwnerId(userId) }).select("_id").lean();
    if (!shelter) {
      return NextResponse.json({ error: "Shelter not found" }, { status: 404 });
    }

    const body = await req.json();

    // minimal validation
    if (!body?.name || !body?.species) {
      return NextResponse.json({ error: "Name and species are required" }, { status: 400 });
    }

    const imagesArray = Array.isArray(body.images)
      ? body.images
      : typeof body.images === "string"
      ? [body.images]
      : [];

    const petDoc = await Pet.create({
      shelterId: shelter._id, // << link!
      name: body.name,
      species: body.species,
      breed: body.breed || "",      
      gender: body.gender || "",
      size: body.size || "",
      age: body.age || "",
      vaccinated: !!body.vaccinated,
      images: imagesArray,
      description: body.description || "",
    });

    return NextResponse.json(
      { ok: true, pet: { ...petDoc.toObject(), _id: String(petDoc._id) } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/shelters/mine/pets failed:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
