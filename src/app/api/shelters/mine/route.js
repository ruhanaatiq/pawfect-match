import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireSession } from "@/lib/guard";
import Shelter from "@/models/Shelter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession(); // throws 401 if not signed in
    await connectDB();

    const userId = String(session.user._id);
    const shelter = await Shelter.findOne({ "members.userId": userId }).lean();
    if (!shelter) return NextResponse.json({ error: "no shelter" }, { status: 404 });

    // Optional: include the caller's role for UI decisions
    const m = (shelter.members || []).find(m => String(m.userId) === userId);
    return NextResponse.json({
      shelter: {
        ...shelter,
        _id: String(shelter._id),
        myRole: m?.role || null,
      },
    });
  } catch (e) {
    console.error("[GET /api/shelters/mine]", e);
    // requireSession() may already have thrown a 401 NextResponse
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
