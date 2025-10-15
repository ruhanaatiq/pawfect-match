// src/app/api/shelters/mine/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserIdFromSession(session) {
  return session?.user?.id || session?.user?._id || session?.user?.sub || null;
}

function asOwnerId(id) {
  // If your schema uses ObjectId for ownerId, cast to ObjectId.
  // If you stored ownerId as a string, just return the string.
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id;
}

function forbid() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  try {
    const session = await auth();
    const userId = getUserIdFromSession(session);
    if (!userId) return forbid();

    await connectDB();

    const s = await Shelter.findOne({ ownerId: asOwnerId(userId) }).lean();
    if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ shelter: { ...s, _id: String(s._id) } });
  } catch (err) {
    console.error("GET /api/shelters/mine failed:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    const userId = getUserIdFromSession(session);
    if (!userId) return forbid();

    await connectDB();

    const s = await Shelter.findOne({ ownerId: asOwnerId(userId) });
    if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // Only allow these fields to be edited by owners
    const allowed = [
      "name",
      "email",
      "phone",
      "address",
      "description",
      "logoUrl",
      "location",   // e.g. { city, state, country, lat, lng }
      "country",
      "city",
      "state",
    ];

    for (const k of allowed) {
      if (k in body) {
        s[k] = body[k];
      }
    }

    await s.save();

    return NextResponse.json({
      ok: true,
      shelter: { ...s.toObject(), _id: String(s._id) },
    });
  } catch (err) {
    console.error("PATCH /api/shelters/mine failed:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
