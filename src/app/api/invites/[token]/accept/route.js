// src/app/api/invites/[token]/accept/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import Shelter from "@/models/Shelter";
import User from "@/models/User";
import { requireSession } from "@/lib/guard";
import { hashToken } from "@/lib/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req, { params }) {
  try {
    const { token } = await params;                 // ← await params
    const session = await requireSession();         // ← returns session or throws 401
    await connectDB();

    const tokenHash = hashToken(token);
    const inv = await ShelterInvite.findOne({ tokenHash });
    if (!inv) return NextResponse.json({ error: "invalid token" }, { status: 400 });
    if (inv.status !== "pending") return NextResponse.json({ error: inv.status }, { status: 400 });
    if (inv.expiresAt && inv.expiresAt < new Date()) {
      inv.status = "expired";
      await inv.save();
      return NextResponse.json({ error: "expired" }, { status: 400 });
    }

    // Must be same email as invite
    const userEmail = String(session.user?.email || "").toLowerCase();
    if (userEmail !== String(inv.email).toLowerCase()) {
      return NextResponse.json(
        { error: "Invite is for a different email. Sign in with the invited email." },
        { status: 403 }
      );
    }

    // Ensure user exists
    const user = await User.findOne({ email: inv.email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please sign up first, then open the invite link again." },
        { status: 403 }
      );
    }

    // Add membership if missing
    const shelter = await Shelter.findById(inv.shelterId);
    if (!shelter) return NextResponse.json({ error: "Shelter not found" }, { status: 404 });

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

    // Mark invite accepted
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
