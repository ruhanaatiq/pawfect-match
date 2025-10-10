// src/app/api/invites/[token]/accept/route.js  (POST accept)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import Shelter from "@/models/Shelter";
import User from "@/models/User";
import { requireSession, respond } from "@/lib/guard";
import { hashToken } from "@/lib/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req, { params }) {
  try {
    await connectDB();
    const { session, response } = await requireSession();
    if (!session) return response;

    const tokenHash = hashToken(params.token);
    const inv = await ShelterInvite.findOne({ tokenHash });
    if (!inv) return respond(400, { error: "invalid token" });
    if (inv.status !== "pending") return respond(400, { error: inv.status });
    if (inv.expiresAt && inv.expiresAt < new Date()) {
      inv.status = "expired"; await inv.save();
      return respond(400, { error: "expired" });
    }

    // The logged-in user's email must match the invite email
    const userEmail = String(session.user.email || "").toLowerCase();
    if (userEmail !== String(inv.email).toLowerCase()) {
      return respond(403, { error: "Invite is for a different email. Sign in with the invited email." });
    }

    // Ensure user exists
    const user = await User.findOne({ email: inv.email });
    if (!user) return respond(403, { error: "Account not found. Please sign up first, then open the invite link again." });

    // Add to shelter.members if not already there
    const shelter = await Shelter.findById(inv.shelterId);
    if (!shelter) return respond(404, { error: "Shelter not found" });

    const already = (shelter.members || []).some(m => String(m.userId) === String(user._id));
    if (!already) {
      shelter.members = shelter.members || [];
      shelter.members.push({
        userId: user._id,
        role: inv.role,
        joinedAt: new Date(),
        status: "active",
      });
      await shelter.save();
    }

    inv.status = "accepted";
    inv.acceptedAt = new Date();
    inv.acceptedByUserId = user._id;
    await inv.save();

    return NextResponse.json({ ok: true, shelterId: String(shelter._id), role: inv.role });
  } catch (e) {
    console.error("[POST /api/invites/:token/accept]", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
