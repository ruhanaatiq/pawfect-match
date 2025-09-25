import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

connectDB();

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ message: "Token expired or invalid" }), {
        status: 400,
      });
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(payload.userId, { password: hashedPassword });

    return new Response(JSON.stringify({ message: "Password updated successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
