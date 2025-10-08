import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import { requireSession } from "@/lib/guard";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await requireSession();
  const { code } = await req.json();
  if (!code) return json({ error: "Invite code required" }, 400);

  await connectDB();
  const s = await Shelter.findOne({ inviteCode: code });
  if (!s) return json({ error: "Invalid code" }, 404);

  const already = s.members.some(m => String(m.userId) === String(session.user._id));
  if (!already) {
    s.members.push({ userId: session.user._id, role: "staff" });
    await s.save();
  }
  return json({ ok: true, shelterId: String(s._id) });
}
