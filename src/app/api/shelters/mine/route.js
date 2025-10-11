// src/app/api/shelters/mine/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";                  // your NextAuth handler
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In some setups user id can be id/_id/sub
    const userId =
      session.user.id || session.user._id || session.user.sub || null;
    if (!userId) {
      return NextResponse.json({ error: "No user id on session" }, { status: 401 });
    }

    await connectDB();

    // Find the shelter owned by this user
    const s = await Shelter.findOne({ ownerId: userId }).lean();
    if (!s) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Serialize _id for the client
    return NextResponse.json({
      shelter: { ...s, _id: String(s._id) },
    });
  } catch (err) {
    console.error("GET /api/shelters/mine failed:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
