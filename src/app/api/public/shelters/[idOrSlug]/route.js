import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  await connectDB();
  const key = params.slug;

  const byId = mongoose.isValidObjectId(key)
    ? await Shelter.findById(key).lean()
    : null;

  const bySlug = byId
    ? null
    : await Shelter.findOne({ slug: key }).lean(); // adjust if your field is different

  const s = byId || bySlug;
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    shelter: {
      ...s,
      _id: String(s._id), // IMPORTANT
      id: String(s._id),  // optional convenience
    },
  });
}
