import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  await connectDB();
  const key = params.id;

  // try slug first
  const bySlug = await Shelter.findOne({ publicSlug: key }).lean();
  if (bySlug) return NextResponse.json({ shelter: bySlug });

  // then plain id
  if (mongoose.isValidObjectId(key)) {
    const byId = await Shelter.findById(key).lean();
    if (byId) return NextResponse.json({ shelter: byId });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
