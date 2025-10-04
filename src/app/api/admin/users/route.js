// src/app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(req) {
  const session = await auth();
  if (!["admin", "superadmin"].includes(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const role = (searchParams.get("role") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 50);

  const filter = {};
  if (q) {
    filter.$or = [
      { email: { $regex: q, $options: "i" } },
      { fullName: { $regex: q, $options: "i" } },
    ];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter, { passwordHash: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}
