// src/app/api/sponsors/[id]/route.js
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/dbConnect";
import { auth } from "@/auth";

const oid = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { status } = await req.json();
    const allowed = new Set(["pending", "approved", "rejected"]);
    if (!allowed.has(status)) return NextResponse.json({ message: "Invalid status" }, { status: 400 });

    const sponsors = await getCollection("sponsors");
    const o = oid(params.id);

    // try ObjectId first, then string fallback
    const r = await sponsors.updateOne(
      o ? { _id: o } : { _id: params.id },
      { $set: { status } }
    );

    if (!r.matchedCount) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/sponsors/[id] error:", e);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const sponsors = await getCollection("sponsors");
    const o = oid(params.id);
    const r = await sponsors.deleteOne(o ? { _id: o } : { _id: params.id });

    if (!r.deletedCount) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/sponsors/[id] error:", e);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
