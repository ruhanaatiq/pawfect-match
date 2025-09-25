import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, code, reason = "verify_email" } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const token = await OtpToken.findOne({ email, reason }).sort({ createdAt: -1 });
    if (!token) {
      return NextResponse.json({ error: "No OTP found or already used" }, { status: 400 });
    }

    if (new Date() > new Date(token.expiresAt)) {
      await OtpToken.deleteMany({ email, reason });
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    if (token.attemptsLeft <= 0) {
      await OtpToken.deleteMany({ email, reason });
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const ok = await bcrypt.compare(code, token.codeHash);
    if (!ok) {
      token.attemptsLeft -= 1;
      await token.save();
      return NextResponse.json({ error: "Invalid code", attemptsLeft: token.attemptsLeft }, { status: 400 });
    }

    // Success — mark user verified if reason is email verification
    const user = await User.findOne({ email });
    if (!user) {
      await OtpToken.deleteMany({ email, reason });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (reason === "verify_email" && !user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    // Clear tokens on success
    await OtpToken.deleteMany({ email, reason });

    return NextResponse.json({ ok: true, verifiedAt: user.emailVerifiedAt || null });
  } catch (e) {
    console.error("OTP verify error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
