// src/app/api/shelter/staff/accept/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import ShelterMember from "@/models/ShelterMember";
import User from "@/models/User";
import { auth } from "@/auth";

export async function POST(req) {
  await connectDB();
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { token, shelterId } = await req.json();
  const invite = await ShelterInvite.findOne({ shelterId, email: session.user.email.toLowerCase(), acceptedAt: { $exists: false } });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Invite expired" }, { status: 410 });

  const ok = await bcrypt.compare(token, invite.tokenHash);
  if (!ok) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const user = await User.findOne({ email: session.user.email.toLowerCase() });
  await ShelterMember.updateOne(
    { shelterId, userId: user._id },
    { $setOnInsert: { role: invite.role, joinedAt: new Date() } },
    { upsert: true }
  );

  invite.acceptedAt = new Date();
  await invite.save();

  return NextResponse.json({ ok: true, role: invite.role });
}
