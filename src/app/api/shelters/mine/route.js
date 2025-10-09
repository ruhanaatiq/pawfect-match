// src/app/api/shelters/mine/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEV = process.env.NODE_ENV !== "production";
const json = (data, status = 200) => NextResponse.json(data, { status });

function devError(e, fallback = "Internal error") {
  if (DEV) return json({ error: e?.message || fallback, stack: e?.stack }, 500);
  return json({ error: fallback }, 500);
}

async function getUserOr401() {
  try {
    const session = await auth();
    if (DEV) console.log("session.user:", session?.user);

    const userIdRaw =
      session?.user?.mongoId || // if you saved it yourself
      session?.user?._id ||
      session?.user?.id ||
      null;

    if (!userIdRaw) return { error: true, res: json({ error: "Unauthorized" }, 401) };

    // Decide how to store/query ownerId
    const isObjId = mongoose.isValidObjectId(userIdRaw);
    const ownerIdFilter = isObjId
      ? new mongoose.Types.ObjectId(userIdRaw)
      : userIdRaw; // allow string ids during dev

    return { userIdRaw, isObjId, ownerIdFilter };
  } catch (e) {
    if (DEV) console.error("auth() failed:", e);
    return { error: true, res: devError(e) };
  }
}

export async function GET() {
  try {
    const u = await getUserOr401(); if (u.error) return u.res;
    await connectDB();
    const s = await Shelter.findOne({ ownerId: u.ownerIdFilter }).lean();
    if (!s) return json({ error: "Not found" }, 404);
    return json({ shelter: { ...s, _id: String(s._id) } });
  } catch (e) {
    console.error("GET /api/shelters/mine:", e);
    return devError(e);
  }
}

export async function POST(req) {
  try {
    const u = await getUserOr401(); if (u.error) return u.res;
    await connectDB();

    // If a shelter already exists for this owner, block creation
    const exists = await Shelter.findOne({ ownerId: u.ownerIdFilter }).lean();
    if (exists) return json({ error: "Shelter already exists" }, 409);

    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    if (!name) return json({ error: "Name is required" }, 400);

    const doc = await Shelter.create({
      name,
      country: String(body?.country || "").trim(),
      phone: String(body?.phone || "").trim(),
      address: String(body?.address || "").trim(),
      description: String(body?.description || "").trim(),
      ownerId: u.ownerIdFilter, 
      status: "pending",
      photos: [],
      email: "",
    });

    return json({ shelter: { ...doc.toObject(), _id: String(doc._id) } }, 201);
  } catch (e) {
    console.error("POST /api/shelters/mine:", e);
    // Duplicate key example
    if (e?.code === 11000) return json({ error: "Duplicate key" }, 409);
    return devError(e);
  }
}

export async function PATCH(req) {
  try {
    const u = await getUserOr401(); if (u.error) return u.res;
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const allowed = ["name", "country", "phone", "address", "description", "photos", "status"];
    const update = {};
    for (const k of allowed) if (k in body) update[k] = body[k];

    const doc = await Shelter.findOneAndUpdate(
      { ownerId: u.ownerIdFilter },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) return json({ error: "Not found" }, 404);
    return json({ shelter: { ...doc, _id: String(doc._id) } });
  } catch (e) {
    console.error("PATCH /api/shelters/mine:", e);
    return devError(e);
  }
}

export async function DELETE() {
  try {
    const u = await getUserOr401(); if (u.error) return u.res;
    await connectDB();

    const doc = await Shelter.findOneAndDelete({ ownerId: u.ownerIdFilter }).lean();
    if (!doc) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/shelters/mine:", e);
    return devError(e);
  }
}
