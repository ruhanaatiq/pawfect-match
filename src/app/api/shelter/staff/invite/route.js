import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import ShelterMember from "@/models/ShelterMember";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["shelter_manager", "shelter_staff", "shelter_volunteer"];

export async function POST(req) {
  await connectDB();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shelterId, email, role } = await req.json();
  if (!shelterId || !email || !ALLOWED.includes(role)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only owner/manager can invite
  const canInvite = (session.shelters || []).some(
    s => s.shelterId === shelterId && ["shelter_owner", "shelter_manager"].includes(s.role)
  );
  if (!canInvite) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Do not invite existing member
  const existingMember = await ShelterMember.findOne({ shelterId, userId: session.user.id, email: email.toLowerCase() });
  if (existingMember) {
    return NextResponse.json({ error: "User already a member" }, { status: 409 });
  }

  // Create invite
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const invite = await ShelterInvite.create({
    shelterId,
    email: email.toLowerCase(),
    role,
    tokenHash,
    expiresAt,
    createdBy: session.user.id,
  });

  const joinUrlBase = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const inviteLink = `${joinUrlBase}/join-shelter?token=${token}&shelterId=${shelterId}`;

  // TODO: send email here (mailer). For dev, return the link:
  return NextResponse.json({ ok: true, inviteId: String(invite._id), inviteLink });
}
