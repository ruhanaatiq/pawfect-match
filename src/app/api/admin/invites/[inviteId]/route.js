import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import { requireAdmin } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  await connectDB();
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { status } = await req.json().catch(() => ({}));
  if (!["revoked", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const inv = await ShelterInvite.findById(params.inviteId);
  if (!inv) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  // Only allow revoking pending invites
  if (status === "revoked" && inv.status !== "pending") {
    return NextResponse.json({ error: `Cannot revoke: status is ${inv.status}` }, { status: 400 });
  }

  inv.status = status;
  await inv.save();

  return NextResponse.json({ ok: true, inviteId: String(inv._id), status: inv.status });
}
