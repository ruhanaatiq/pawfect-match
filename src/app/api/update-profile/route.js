// src/app/api/update-profile/route.js
import { getServerSession } from "next-auth/next";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const data = await request.json();
    await connectDB();

    await User.updateOne(
      { email: session.user.email },
      { $set: { name: data.name, email: data.email } }
    );

    return new Response(JSON.stringify({ message: "Profile updated" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to update profile", { status: 500 });
  }
}
