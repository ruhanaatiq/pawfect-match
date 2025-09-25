import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";
import { sendOtpEmail } from "@/lib/mailer";

// Ensure Node runtime (nodemailer won't run on Edge)
export const runtime = "nodejs";
// Avoid caching
export const dynamic = "force-dynamic";

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    await connectDB();
    const { email, reason = "verify_email" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ error: "No account found with that email" }, { status: 404 });
    }

    if (reason === "verify_email" && user.emailVerifiedAt) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    // wipe prior tokens for this email/reason
    await OtpToken.deleteMany({ email, reason });

    const code = makeCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpToken.create({
      email,
      codeHash,
      expiresAt,
      attemptsLeft: 5,
      reason,
      createdIp: req.headers.get("x-forwarded-for") || "unknown",
    });

    // In dev, log the code so you can test even if mail fails
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] OTP for ${email}:`, code);
    }

    // Try to send; don't 500 if SMTP is misconfigured
    try {
      await sendOtpEmail(email, code);
      return NextResponse.json({ ok: true, sent: true, expiresInSec: 600 });
    } catch (mailErr) {
      console.error("sendOtpEmail failed:", mailErr?.message || mailErr);
      return NextResponse.json({
        ok: true,
        sent: false,
        note: "OTP created but email could not be sent. Check SMTP settings.",
        expiresInSec: 600,
      });
    }
  } catch (e) {
    console.error("OTP request error:", e);
    // Surface a more helpful message in dev
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Server error" : e.message },
      { status: 500 }
    );
  }
}
