import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import ResetToken from "@/models/ResetToken";
import { sendPasswordResetEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await User.findOne({ email }).lean();

    // Always return 200 (avoid account enumeration)
    if (!user) return NextResponse.json({ ok: true });

    // Invalidate older tokens
    await ResetToken.deleteMany({ email, usedAt: { $exists: false } });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await ResetToken.create({
      email,
      tokenHash,
      expiresAt,
      createdIp: req.headers.get("x-forwarded-for") || "unknown",
    });

    // Build reset link using NEXTAUTH_URL as base
    const base =
      (process.env.NEXTAUTH_URL || "").replace(/\/$/, "") ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const link = `${base}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await sendPasswordResetEmail(email, link);
    } catch (err) {
      console.error("reset email failed:", err?.message || err);
      // still return ok, token exists
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("password/request error:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Server error" : e.message },
      { status: 500 }
    );
  }
}
