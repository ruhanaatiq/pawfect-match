// Public: list shelters (searchable)
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(24, Math.max(1, parseInt(searchParams.get("pageSize") || "21", 10)));

    // Allow both "verified" and "accepted" (if you use that name)
    const statusFilter = { status: { $in: ["verified", "accepted"] } };

    const find = q
      ? {
          ...statusFilter,
          $or: [
            { name: { $regex: q, $options: "i" } },
            { "location.city": { $regex: q, $options: "i" } },
            { "location.state": { $regex: q, $options: "i" } },
            { address: { $regex: q, $options: "i" } },
          ],
        }
      : statusFilter;

    const cursor = Shelter.find(find)
      .select("name publicSlug address location city state country email phone status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const [items, total] = await Promise.all([cursor, Shelter.countDocuments(find)]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 21 });
  }
}
