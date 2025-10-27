// src/app/api/sponsor/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ GET: list sponsorship requests (filtered by email if provided)
export async function GET(req) {
  try {
    const sponsors = await getCollection("sponsors");
    const { searchParams } = new URL(req.url);

    const email  = searchParams.get("email");   // e.g. user@site.com
    const status = searchParams.get("status");  // optional
    const q      = searchParams.get("q");       // optional search

    const filter = {};
    if (email) filter.userEmail = email;
    if (status && status !== "all") filter.status = status;
    if (q) {
      filter.$or = [
        { userEmail: { $regex: q, $options: "i" } },
        { org: { $regex: q, $options: "i" } },
      ];
    }

    const items = await sponsors.find(filter).sort({ appliedAt: -1 }).toArray();
    return NextResponse.json(items, { status: 200 }); // ← return ARRAY (what your client expects)
  } catch (err) {
    console.error("GET /api/sponsor error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// (optional) keep your POST here too
