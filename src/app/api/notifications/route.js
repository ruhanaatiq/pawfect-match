// src/app/api/notifications/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

import Adoption from "@/models/Adoption";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json([], { status: 400 });

  const newApprovals = await Adoption.find({
    "applicant.email": email,
    status: "approved",
    notified: false,
  });

  // mark them as notified
  if (newApprovals.length > 0) {
    const ids = newApprovals.map((a) => a._id);
    await Adoption.updateMany({ _id: { $in: ids } }, { notified: true });
  }

  return NextResponse.json(newApprovals);
}
