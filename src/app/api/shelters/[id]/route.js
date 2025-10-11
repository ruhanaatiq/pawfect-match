// src/app/api/shelters/[id]/route.js
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import { requireSession, requireShelterRole } from "@/lib/guard";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const session = await requireSession();
  const { shelter } = await requireShelterRole(params.id, ["owner", "manager", "staff"]);

  // ensure member
  const isMember = shelter.members.some((m) => String(m.userId) === String(session.user._id));
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ shelter });
}

export async function PATCH(req, { params }) {
  const session = await requireSession();
  const { assert } = await requireShelterRole(params.id, ["owner", "manager"]);
  assert(session.user._id);

  await connectDB();
  const patch = await req.json();
  const s = await Shelter.findByIdAndUpdate(params.id, patch, { new: true }).lean();

  return NextResponse.json({ shelter: s });
}
