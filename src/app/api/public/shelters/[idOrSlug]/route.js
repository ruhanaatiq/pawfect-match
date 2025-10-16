// src/app/api/public/shelters/[idOrSlug]/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(_req, { params }) {
  try {
    const shelters = await getCollection("shelters");
    const key = params.idOrSlug;

    let query = { slug: key };
    if (ObjectId.isValid(key)) {
      query = { $or: [{ _id: new ObjectId(key) }, { slug: key }] };
    }

    const s = await shelters.findOne(query);
    if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ shelter: { ...s, _id: String(s._id) } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
