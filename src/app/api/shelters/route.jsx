import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import Shelter from "@/models/Shelter";
import ShelterMember from "@/models/ShelterMember";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // (optional) gate to admins or shelter_owner
    const isAdmin = ["admin","superadmin"].includes(session.user.role);
    if (!isAdmin) {
      // allow everyone to create and become owner – or tighten if you want
    }

    const body = await req.json();
    const { name, email, phone, website, address, city, state, zip, description } = body || {};
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const doc = await Shelter.create({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      location: { address, city, state, zip },
      description: description || "",
      ownerUserId: new mongoose.Types.ObjectId(session.user.id),
    });

    // make creator the shelter_owner
    await ShelterMember.updateOne(
      { shelterId: doc._id, userId: session.user.id },
      { $setOnInsert: { role: "shelter_owner" } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/shelters]", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
