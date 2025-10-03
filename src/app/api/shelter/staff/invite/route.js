// src/app/api/shelter/staff/invite/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import ShelterMember from "@/models/ShelterMember";
import ShelterInvite from "@/models/ShelterInvite";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function originFromHeaders() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req) {
  await connectDB();
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const shelterId = String(body.shelterId || "");
  const emailRaw  = String(body.email || "");
  const role      = String(body.role || "").toLowerCase();

  const allowed = new Set(["shelter_manager", "shelter_staff", "shelter_volunteer"]);
  if (!shelterId || !emailRaw || !allowed.has(role)) {
    return NextResponse.json({ error: "shelterId, email and valid role required" }, { status: 400 });
  }

  const email = emailRaw.trim().toLowerCase();

  // Check permissions: session.shelters (if present) OR fallback DB check
  let canInvite =
    (session.shelters || []).some(
      (s) =>
        String(s.shelterId) === shelterId &&
        (s.role === "shelter_owner" || s.role === "shelter_manager")
    );

  if (!canInvite) {
    const membership = await ShelterMember.findOne({
      shelterId,
      userId: session.user.id,
      role: { $in: ["shelter_owner", "shelter_manager"] },
    }).lean();
    canInvite = !!membership;
  }

  if (!canInvite) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // De-dupe any existing unaccepted, unexpired invite for same email/shelter
  await ShelterInvite.deleteMany({
    shelterId,
    email,
    acceptedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  // Create new invite
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await ShelterInvite.create({
    shelterId,
    email,
    role,
    tokenHash,
    expiresAt,
    createdBy: session.user.id,
  });

  // Build robust invite link from current request origin
  const link = `${originFromHeaders()}/join-shelter?token=${encodeURIComponent(
    token
  )}&shelterId=${encodeURIComponent(shelterId)}`;

  // TODO: send via your mailer
  // await sendEmail({ to: email, subject: "You're invited", html: `Join: <a href="${link}">${link}</a>` });

  return NextResponse.json({ ok: true, inviteLink: link });
}
