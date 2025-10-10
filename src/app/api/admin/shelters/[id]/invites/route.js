// src/app/api/admin/shelters/[id]/invites/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import ShelterInvite from "@/models/ShelterInvite";
import { requireAdmin, respond } from "@/lib/guard";
import { makeToken, hashToken } from "@/lib/invites";
import { sendMail } from "@/lib/mailer"; // your existing mailer

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { session, response } = await requireAdmin();
    if (!session) return response;

    const shelterId = params.id;
    const { email, role = "staff", ttlHours = 72 } = await req.json().catch(() => ({}));
    if (!email) return respond(400, { error: "email required" });
    if (!["owner","manager","staff"].includes(role)) return respond(400, { error: "invalid role" });

    const shelter = await Shelter.findById(shelterId).lean();
    if (!shelter) return respond(404, { error: "Shelter not found" });

    // single-use token
    const token = makeToken(24);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);

    // Optional: revoke pending invites for same email+shelter
    await ShelterInvite.updateMany({ shelterId, email, status: "pending" }, { $set: { status: "revoked" } });

    const invite = await ShelterInvite.create({
      tokenHash,
      email: email.toLowerCase(),
      shelterId,
      role,
      invitedByUserId: session.user._id,
      invitedByEmail: session.user.email,
      expiresAt,
      status: "pending",
    });

    // Build URL for email
    // Use headers() on server pages to compute base; here we fallback to env
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const inviteUrl = `${base}/invite/${token}`;

    // Send email
    await sendMail({
      to: email,
      subject: `You're invited to join ${shelter.name} on Pawfect Match`,
      html: `
        <p>Hello,</p>
        <p>You have been invited to join <b>${shelter.name}</b> as <b>${role}</b>.</p>
        <p>This link will expire on <b>${expiresAt.toLocaleString()}</b>.</p>
        <p><a href="${inviteUrl}">Accept Invitation</a></p>
        <p>If you did not expect this, you can ignore this email.</p>
      `,
    });

    return NextResponse.json({ ok: true, inviteId: String(invite._id), inviteUrl, expiresAt });
  } catch (e) {
    console.error("[POST /api/admin/shelters/:id/invites]", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
