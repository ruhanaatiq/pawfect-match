import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  await connectDB();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invite = await ShelterInvite.findById(params.id).lean();
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canManage = (session.shelters || []).some(
    s => s.shelterId === String(invite.shelterId) && ["shelter_owner", "shelter_manager"].includes(s.role)
  );
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ShelterInvite.deleteOne({ _id: invite._id });
  return NextResponse.json({ ok: true });
}
