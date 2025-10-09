// src/lib/guard.js
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import User from "@/models/User";                 // ⬅ add this
import { NextResponse } from "next/server";

export async function requireSession() {
  const session = await auth();

  // If _id missing but we have email, fetch from DB once
  if (!session?.user?._id && session?.user?.email) {
    await connectDB();
    const u = await User.findOne({ email: session.user.email })
      .select("_id role")
      .lean();

    if (u) {
      session.user._id = String(u._id);
      if (!session.user.role && u.role) session.user.role = u.role;
    }
  }

  if (!session?.user?._id) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireShelterRole(shelterId, allowedRoles = ["owner","manager","staff"]) {
  await connectDB();
  const s = await Shelter.findById(shelterId).lean();
  if (!s) {
    throw NextResponse.json({ error: "Shelter not found" }, { status: 404 });
  }
  return {
    shelter: s,
    assert: (userId) => {
      const m = s.members?.find(m => String(m.userId) === String(userId));
      if (!m || !allowedRoles.includes(m.role)) {
        throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return m.role;
    }
  };
}
