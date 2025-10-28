import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const sponsors = await getCollection("sponsors");

    const result = await sponsors.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Sponsor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/sponsors/:id error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
