// src/app/api/bookVet/route.js
import { getCollection } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import authConfig from "@/auth.config";   // ← same config you used in the auth route

export const runtime = "nodejs";

export async function POST(req) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const { vetId } = await req.json();
  const userEmail = session.user.email;

  const bookingCollection = await getCollection("bookings");
  const existing = await bookingCollection.findOne({ vetId, userEmail });
  if (existing) {
    return Response.json({ success: false, message: "Already booked" });
  }

  await bookingCollection.insertOne({ vetId, userEmail, bookedAt: new Date() });
  return Response.json({ success: true, message: "Vet booked successfully" });
}
