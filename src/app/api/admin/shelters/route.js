import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function forbid() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(req) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

  const query = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
          { state: { $regex: q, $options: "i" } },
          { country: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const total = await Shelter.countDocuments(query);
  const items = await Shelter.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const shaped = items.map((s) => ({ ...s, _id: String(s._id) }));
  return NextResponse.json({ page, pageSize, total, items: shaped });
}

export async function POST(req) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

  await connectDB();
  const body = await req.json().catch(() => ({}));
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const created = await Shelter.create({
    name: body.name.trim(),
    email: body.email?.trim() || "",
    phone: body.phone?.trim() || "",
    website: body.website?.trim() || "",
    address: body.address?.trim() || "",
    city: body.city?.trim() || "",
    state: body.state?.trim() || "",
    postalCode: body.postalCode?.trim() || "",
    country: body.country?.trim() || "",
    description: body.description?.trim() || "",
  });

  return NextResponse.json({ ok: true, shelter: { ...created.toObject(), _id: String(created._id) } }, { status: 201 });
}
