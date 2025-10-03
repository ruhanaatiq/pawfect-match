import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import ShelterMember from "@/models/ShelterMember";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["shelter_owner", "shelter_manager", "shelter_staff", "shelter_volunteer"];

export async function PATCH(req, { params }) {
  await connectDB();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const newRole = body?.role;
  if (!ALLOWED.includes(newRole)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const member = await ShelterMember.findById(params.memberId).lean();
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only owner/manager of that shelter can change roles
  const canManage = (session.shelters || []).some(
    s => s.shelterId === String(member.shelterId) && ["shelter_owner", "shelter_manager"].includes(s.role)
  );
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ShelterMember.updateOne({ _id: member._id }, { $set: { role: newRole } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  await connectDB();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await ShelterMember.findById(params.memberId).lean();
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canManage = (session.shelters || []).some(
    s => s.shelterId === String(member.shelterId) && ["shelter_owner", "shelter_manager"].includes(s.role)
  );
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ShelterMember.deleteOne({ _id: member._id });
  return NextResponse.json({ ok: true });
}
