import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

function fallbackAvatarFor(emailOrName) {
  const seed = encodeURIComponent(emailOrName || "user");
  // Identicon; you can switch to initials with: https://api.dicebear.com/9.x/initials/svg?seed=...
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`;
}

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, photoURL } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({
      name,
      email,
      passwordHash,
      photoURL: photoURL?.trim() || fallbackAvatarFor(email || name), // ✅ ensure avatar
      role: "user",
    });

    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
