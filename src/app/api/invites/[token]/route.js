// src/app/api/invites/[token]/route.js  (GET validate)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import Shelter from "@/models/Shelter";
import { hashToken } from "@/lib/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const tokenHash = hashToken(params.token);

    const inv = await ShelterInvite.findOne({ tokenHash }).lean();
    if (!inv) return NextResponse.json({ valid: false, reason: "invalid" });

    if (inv.status !== "pending") return NextResponse.json({ valid: false, reason: inv.status });
    if (inv.expiresAt && inv.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: "expired" });
    }
    const shelter = await Shelter.findById(inv.shelterId).select("name").lean();

    return NextResponse.json({
      valid: true,
      email: inv.email,
      role: inv.role,
      shelter: shelter?.name || "Shelter",
      expiresAt: inv.expiresAt,
    });
  } catch (e) {
    console.error("[GET /api/invites/:token]", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
