// src/app/api/shelter/apply/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import ShelterMember from "@/models/ShelterMember";
import { auth } from "@/auth"; // NextAuth helper (or use getServerSession)

export async function POST(req) {
  await connectDB();
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, phone, address } = await req.json();

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const shelter = await Shelter.create({
    name,
    ownerId: session.user.id,
    email: email || session.user.email,
    phone,
    address,
    status: "pending_review",
  });

  // creator becomes owner
  await ShelterMember.create({
    shelterId: shelter._id,
    userId: session.user.id,
    role: "shelter_owner",
  });

  return NextResponse.json({ ok: true, shelterId: String(shelter._id), status: shelter.status });
}
