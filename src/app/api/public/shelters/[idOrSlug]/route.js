import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(_req, { params }) {
  try {
    const shelters = await getCollection("shelters");
    const key = params.idOrSlug;

    let shelter = null;
    if (ObjectId.isValid(key)) {
      shelter = await shelters.findOne({ _id: new ObjectId(key) });
      if (!shelter) shelter = await shelters.findOne({ slug: key });
    } else {
      shelter = await shelters.findOne({ slug: key });
    }

    if (!shelter) {
      return NextResponse.json({ error: "Shelter not found" }, { status: 404 });
    }

    // Keep as-is but ensure _id is a string for the client
    const data = { ...shelter, _id: String(shelter._id) };
    const res = NextResponse.json({ shelter: data });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch (e) {
    console.error("GET /api/public/shelters/[idOrSlug] error:", e);
    return NextResponse.json({ error: "Failed to fetch shelter" }, { status: 500 });
  }
}
