import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const POST = async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remaining = Math.ceil((user.lockUntil - new Date()) / 1000);
      return new Response(JSON.stringify({ error: `Too many failed attempts. Locked for ${remaining}s.`, lockTime: remaining }), { status: 403 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash || "");
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock after 3 failed attempts
      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 60 * 1000); // 60 sec lock
      }

      await user.save();

      const remaining = user.lockUntil ? Math.ceil((user.lockUntil - new Date()) / 1000) : 0;

      return new Response(
        JSON.stringify({
          error: user.loginAttempts >= 3
            ? `Too many failed attempts. Locked for ${remaining}s.`
            : "Invalid credentials",
          lockTime: user.loginAttempts >= 3 ? remaining : undefined,
        }),
        { status: user.loginAttempts >= 3 ? 403 : 401 }
      );
    }

    // Successful login: reset attempts & lock
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Check email verification
    if (!user.emailVerifiedAt) {
      return new Response(JSON.stringify({ error: "Email not verified" }), { status: 401 });
    }

    return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
