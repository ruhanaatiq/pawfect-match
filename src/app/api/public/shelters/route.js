// src/app/api/public/shelters/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";

const ALLOWED = (process.env.PUBLIC_SHELTER_STATUSES || "verified,accepted,approved,active")
  .split(",").map(s => s.trim()).filter(Boolean);

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const pageSize = 21;

  // ⚠️ RELAXED filter: show all unless you set env PUBLIC_SHELTER_STATUSES_STRICT=true
  const base = process.env.PUBLIC_SHELTER_STATUSES_STRICT === "true"
    ? { $or: [{ status: { $in: ALLOWED } }, { status: { $exists: false } }, { status: "" }, { status: null }] }
    : {}; // ← show everything

  const filter = { ...base };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { address: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { "location.city": { $regex: q, $options: "i" } },
      { "location.state": { $regex: q, $options: "i" } },
      { "location.country": { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } }, // if location is a string in some docs
    ];
  }

  const [items, total] = await Promise.all([
    Shelter.find(filter)
      .select("_id name publicSlug location address email phone status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Shelter.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
