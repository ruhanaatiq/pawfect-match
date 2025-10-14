// src/app/api/public/shelters/[idOrSlug]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import mongoose from "mongoose";

const ALLOWED = (process.env.PUBLIC_SHELTER_STATUSES || "verified,accepted,approved,active")
  .split(",").map(s => s.trim()).filter(Boolean);

export async function GET(_req, { params }) {
  await connectDB();
  const { idOrSlug } = params;
  const isId = mongoose.Types.ObjectId.isValid(idOrSlug);

  const base = process.env.PUBLIC_SHELTER_STATUSES_STRICT === "true"
    ? { $or: [{ status: { $in: ALLOWED } }, { status: { $exists: false } }, { status: "" }, { status: null }] }
    : {};

  const match = isId ? { _id: idOrSlug } : { publicSlug: idOrSlug };
  const shelter = await Shelter.findOne({ ...base, ...match }).lean();

  if (!shelter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ shelter });
}
