// src/app/api/auth/reset-password/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

function assertEnv() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("Missing NEXTAUTH_SECRET");
  }
}

function validatePassword(pw) {
  // keep it simple; tweak as you like
  if (typeof pw !== "string") return "Password is required";
  const trimmed = pw.trim();
  if (trimmed.length < 8) return "Password must be at least 8 characters";
  return null;
}

export async function POST(req) {
  try {
    assertEnv();

    const { token, password } = await req.json();

    const pwdErr = validatePassword(password);
    if (!token || pwdErr) {
      return NextResponse.json(
        { ok: false, error: pwdErr || "Invalid data" },
        { status: 400 }
      );
    }

    // Verify token (1h expiry as issued by your forgot route)
    let payload;
    try {
      payload = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    } catch (err) {
      const msg = err?.name === "TokenExpiredError" ? "Token expired" : "Token invalid";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    await connectDB();

    // Find user defensively
    const userId = String(payload?.userId || "");
    const user = userId ? await User.findById(userId).select("_id password") : null;
    if (!user) {
      // generic response to avoid leaking details
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    // Update password
    const hashed = await bcrypt.hash(password.trim(), 12);

    // Optionally bump a field to invalidate old sessions (see note below)
    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashed,
        passwordChangedAt: new Date(), // helpful if you check this in NextAuth JWT callback
      },
      $unset: {
        resetTokenHash: "", // harmless if you don’t use DB tokens
        resetTokenExp: "",
      },
    });

    return NextResponse.json({ ok: true, message: "Password updated successfully" }, { status: 200 });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
