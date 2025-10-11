import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import { requireAdmin } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  await connectDB();
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id: shelterId } = params;

  // Pending + recent (last 30 days) non-pending for context
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const items = await ShelterInvite.find({
    shelterId,
    $or: [{ status: "pending" }, { createdAt: { $gte: since } }],
  })
    .sort({ createdAt: -1 })
    .select("_id email role status expiresAt inviteUrl createdAt")
    .lean();

  return NextResponse.json({ items: items.map(i => ({ ...i, _id: String(i._id) })) });
}
