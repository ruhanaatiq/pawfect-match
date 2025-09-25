import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

connectDB();

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ message: "User with this email does not exist" }),
        { status: 404 }
      );
    }

    // Generate reset token (expires in 1 hour)
    const token = jwt.sign(
      { userId: user._id },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "1h" }
    );

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;


    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // or any SMTP
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // email password or app password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });

    return new Response(JSON.stringify({ message: "Reset email sent" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
