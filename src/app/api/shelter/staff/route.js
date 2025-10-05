import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import ShelterMember from "@/models/ShelterMember";
import ShelterInvite from "@/models/ShelterInvite";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDB();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const shelterId = searchParams.get("shelterId"); // if null you can derive from session later

  // derive a default: first shelter membership for this user
  let _shelterId = shelterId;
  if (!_shelterId && Array.isArray(session.shelters) && session.shelters.length) {
    _shelterId = session.shelters[0].shelterId;
  }
  if (!_shelterId) return NextResponse.json({ error: "Missing shelterId" }, { status: 400 });

  // members
  const members = await ShelterMember.find({ shelterId: _shelterId }).lean();
  const userIds = members.map(m => m.userId);
  const users = userIds.length ? await User.find({ _id: { $in: userIds } }, { name: 1, email: 1, photoURL: 1 }).lean() : [];
  const userMap = new Map(users.map(u => [String(u._id), u]));

  const shapedMembers = members.map(m => ({
    id: String(m._id),
    role: m.role,
    joinedAt: m.createdAt,
    user: (() => {
      const u = userMap.get(String(m.userId));
      return u ? { id: String(u._id), name: u.name, email: u.email, image: u.photoURL || null } : null;
    })(),
  }));

  // invites
  const invites = await ShelterInvite.find({ shelterId: _shelterId, acceptedBy: { $exists: false } })
    .sort({ createdAt: -1 })
    .lean();

  const shapedInvites = invites.map(i => ({
    id: String(i._id),
    email: i.email,
    role: i.role,
    expiresAt: i.expiresAt,
    createdAt: i.createdAt,
  }));

  return NextResponse.json({ shelterId: _shelterId, members: shapedMembers, invites: shapedInvites });
}
