import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Favorite from "@/models/Favorite";
import Pet from "@/models/Pets";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const favorites = await Favorite.find({ userEmail: email }).populate("petId").lean();

    // Map to include pet details
    const favList = favorites.map(fav => ({
      _id: fav._id,
      pet: fav.petId,
    }));

    return NextResponse.json(favList, { status: 200 });
  } catch (err) {
    console.error("Favorites GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
