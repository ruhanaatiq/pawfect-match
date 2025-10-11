// src/app/api/admin/shelters/[id]/invites/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import ShelterInvite from "@/models/ShelterInvite";
import { requireAdmin, respond } from "@/lib/guard";
import { makeToken, hashToken } from "@/lib/invites";
import { sendInviteEmail } from "@/lib/mailer"; // use the helper you added

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
    if (!["owner", "manager", "staff"].includes(role)) return respond(400, { error: "invalid role" });

    const shelter = await Shelter.findById(shelterId).lean();
    if (!shelter) return respond(404, { error: "Shelter not found" });

    const token = makeToken(24);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + (Number(ttlHours) || 72) * 3600 * 1000);

    // revoke any older pending invites for same email+shelter
    await ShelterInvite.updateMany(
      { shelterId, email: email.toLowerCase(), status: "pending" },
      { $set: { status: "revoked" } }
    );

    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const inviteUrl = `${base}/invite/${token}`;

    const invite = await ShelterInvite.create({
      tokenHash,
      email: email.toLowerCase(),
      shelterId,
      role,
      invitedByUserId: session.user._id,
      invitedByEmail: session.user.email,
      expiresAt,
      status: "pending",
      inviteUrl, // handy for list/resend
    });

    // Send the email (non-fatal if it fails; admin still gets the link)
    try {
      await sendInviteEmail({
        to: email,
        shelterName: shelter.name,
        role,
        inviteUrl,
        expiresAt,
      });
    } catch (e) {
      console.warn("[invites] email send failed:", e?.message || e);
      // do not fail the request — UI can copy inviteUrl
    }

    return NextResponse.json({
      ok: true,
      inviteId: String(invite._id),
      inviteUrl,
      expiresAt,
    });
  } catch (e) {
    console.error("[POST /api/admin/shelters/:id/invites]", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
