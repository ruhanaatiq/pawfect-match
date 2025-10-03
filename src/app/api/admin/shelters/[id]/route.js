import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(_req, { params }) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

  await connectDB();
  const s = await Shelter.findById(params.id).lean();
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ shelter: { ...s, _id: String(s._id) } });
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

  await connectDB();
  const body = await req.json().catch(() => ({}));

  const allowed = [
    "name",
    "email",
    "phone",
    "website",
    "address",
    "city",
    "state",
    "postalCode",
    "country",
    "description",
  ];
  const $set = {};
  for (const k of allowed) if (k in body) $set[k] = typeof body[k] === "string" ? body[k].trim() : body[k];

  const updated = await Shelter.findByIdAndUpdate(params.id, { $set }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, shelter: { ...updated, _id: String(updated._id) } });
}

export async function DELETE(_req, { params }) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

  await connectDB();
  const res = await Shelter.deleteOne({ _id: params.id });
  return NextResponse.json({ ok: res.deletedCount === 1 });
}
