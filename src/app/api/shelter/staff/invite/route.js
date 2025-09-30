// src/app/api/shelter/staff/invite/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import ShelterMember from "@/models/ShelterMember";
import ShelterInvite from "@/models/ShelterInvite";
// import { sendEmail } from "@/lib/mailer"; // your mailer
import { auth } from "@/auth";

export async function POST(req) {
  await connectDB();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shelterId, email, role } = await req.json();
  const allowed = ["shelter_manager","shelter_staff","shelter_volunteer"];
  if (!allowed.includes(role)) return NextResponse.json({ error: "invalid role" }, { status: 400 });

  // Only owner/manager can invite
  const canInvite = (session.shelters || []).some(s => s.shelterId === shelterId && ["shelter_owner","shelter_manager"].includes(s.role));
  if (!canInvite) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // create token
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await ShelterInvite.create({ shelterId, email: email.toLowerCase(), role, tokenHash, expiresAt, createdBy: session.user.id });

  const link = `${process.env.NEXTAUTH_URL}/join-shelter?token=${token}&shelterId=${shelterId}`;
  // await sendEmail(email, "You're invited", `Join: ${link}`);

  return NextResponse.json({ ok: true, inviteLink: link }); // (show link in dev)
}
