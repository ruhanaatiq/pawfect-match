// src/app/api/auth/forgot-password/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

function baseUrl() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  // prefer NEXTAUTH_URL if set (you already have it)
  return (process.env.NEXTAUTH_URL || `${proto}://${host}`).replace(/\/+$/, "");
}

function transporterFromEnv() {
  // uses your existing .env.local names
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("Missing SMTP_USER/SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,       // true for 465, false for 587
    auth: { user, pass },
  });
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    const normalized = String(email).toLowerCase().trim();

    await connectDB();

    const user = await User.findOne({ email: normalized }).select("_id");
    if (user) {
      const token = jwt.sign(
        { userId: String(user._id) },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: "1h" }
      );

      const resetLink = `${baseUrl()}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalized)}`;

      const transporter = transporterFromEnv();

      // optional but helpful for debugging SMTP issues
      try {
        await transporter.verify();
      } catch (e) {
        console.error("SMTP verify failed:", e);
        throw e; // will return 500, but no user info leaks
      }

      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER, // your MAIL_FROM
        to: normalized,
        subject: "Reset your Pawfect Match password",
        html: `
          <p>We received a request to reset your password.</p>
          <p><a href="${resetLink}">Click here to reset</a> (valid for 1 hour).</p>
          <p>If you didn't request this, you can ignore this email.</p>
        `,
      });
    }

    // Generic success either way
    return NextResponse.json(
      { ok: true, message: "If that email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ ok: false, error: "Could not send reset link" }, { status: 500 });
  }
}
