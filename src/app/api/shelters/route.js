// src/app/api/shelters/route.js
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import { requireSession } from "@/lib/guard";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    await connectDB();
    const shelters = await Shelter.find({ "members.userId": session.user._id })
      .select("_id name verifiedAt members inviteCode")
      .lean();
    return NextResponse.json({ shelters });
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Unexpected error";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req) {
  try {
    const session = await requireSession();
    const body = await req.json();
    await connectDB();
    const inviteCode = crypto.randomBytes(6).toString("hex");
    const shelter = await Shelter.create({
      name: body.name,
      email: body.email || "",
      phone: body.phone || "",
      address: body.address || "",
      inviteCode,
      members: [{ userId: session.user._id, role: "owner" }],
    });
    return NextResponse.json(
      { shelter: { ...shelter.toObject(), _id: String(shelter._id) } },
      { status: 201 }
    );
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Unexpected error";
    return NextResponse.json({ error: message }, { status });
  }
}
