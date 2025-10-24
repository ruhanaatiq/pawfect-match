// src/app/api/pets/[id]/campaigns/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import { auth } from "@/auth"; // next-auth helper you already use

function forbid() {
  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
}
function ok(json, init) { return NextResponse.json(json, init); }

export async function GET(_req, { params }) {
  await connectDB();
  const items = await Campaign.find({ petId: params.id }).sort({ createdAt: -1 }).lean();
  return ok({
    success: true,
    campaigns: items.map(c => ({
      _id: String(c._id),
      title: c.title,
      description: c.description,
      goal: c.goal,
      raised: c.raised,
      status: c.status,
      createdAt: c.createdAt,
    })),
  });
}

export async function POST(req, { params }) {
  const session = await auth();
  if (!["admin", "superadmin", "shelter"].includes(session?.user?.role)) return forbid();

  let body; try { body = await req.json(); } catch { return ok({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const { title, description, goal, status = "Active" } = body || {};
  if (!title) return ok({ success: false, error: "Title required" }, { status: 400 });

  await connectDB();
  const created = await Campaign.create({ petId: params.id, title, description, goal: Number(goal)||0, status });
  return ok({ success: true, campaign: { _id: String(created._id), ...body } }, { status: 201 });
}

export async function PUT(req) {
  const session = await auth();
  if (!["admin", "superadmin", "shelter"].includes(session?.user?.role)) return forbid();

  let body; try { body = await req.json(); } catch { return ok({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const { campaignId, ...rest } = body || {};
  if (!campaignId) return ok({ success: false, error: "campaignId required" }, { status: 400 });

  await connectDB();
  await Campaign.findByIdAndUpdate(campaignId, rest);
  return ok({ success: true });
}

export async function DELETE(req) {
  const session = await auth();
  if (!["admin", "superadmin", "shelter"].includes(session?.user?.role)) return forbid();

  let body; try { body = await req.json(); } catch { return ok({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const { campaignId } = body || {};
  if (!campaignId) return ok({ success: false, error: "campaignId required" }, { status: 400 });

  await connectDB();
  await Campaign.findByIdAndDelete(campaignId);
  return ok({ success: true });
}
