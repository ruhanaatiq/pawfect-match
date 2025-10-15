export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; // your NextAuth helper (App Router)
import { connectDB } from "@/lib/mongoose";
import Favorite from "@/models/Favorite";
import mongoose from "mongoose";

export async function DELETE(_req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const fav = await Favorite.findById(id).lean();
  if (!fav) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (String(fav.userId) !== String(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Favorite.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
