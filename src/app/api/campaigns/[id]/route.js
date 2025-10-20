import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import  Campaign from "@/models/Campaign"; // your Mongoose model
export async function GET(_req, { params }) {
  await connectDB();
  const c = await Campaign.findById(params.id).lean();
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    _id: String(c._id),
    title: c.title,
    description: c.description,
    status: c.status,
    targetAmount: c.goal,
    raisedAmount: c.raised,
    participants: c.participants ?? [],
  });
}

export async function POST(req, { params }) {
  await connectDB();
  const { amount, participantName, participantEmail } = await req.json();
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  const c = await Campaign.findById(params.id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  c.participants = c.participants || [];
  c.participants.push({ name: participantName, email: participantEmail, amount: amt, date: new Date() });
  c.raised = (c.raised || 0) + amt;
  await c.save();

  return NextResponse.json({ ok: true });
}
