import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ShelterInvite from "@/models/ShelterInvite";
import Shelter from "@/models/Shelter";
import { requireAdmin } from "@/lib/guard";
import { sendMail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req, { params }) {
  await connectDB();
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const inv = await ShelterInvite.findById(params.inviteId).lean();
  if (!inv) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (inv.status !== "pending") {
    return NextResponse.json({ error: `Cannot resend: status is ${inv.status}` }, { status: 400 });
  }
  if (inv.expiresAt && inv.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }

  const shelter = await Shelter.findById(inv.shelterId).select("name").lean();

  await sendMail({
    to: inv.email,
    subject: `You're invited to join ${shelter?.name || "Shelter"} on Pawfect Match`,
    html: `
      <p>Hello,</p>
      <p>You have been invited to join <b>${shelter?.name || "the shelter"}</b> as <b>${inv.role}</b>.</p>
      <p>This link may expire on <b>${inv.expiresAt ? new Date(inv.expiresAt).toLocaleString() : "—"}</b>.</p>
      <p><a href="${inv.inviteUrl}">Accept Invitation</a></p>
    `,
  });

  return NextResponse.json({ ok: true });
}
