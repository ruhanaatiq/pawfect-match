import { getCollection } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const { vetId } = await req.json();
  const userEmail = session.user.email;

  const bookingCollection = await getCollection("bookings");

  // Check if user already booked this vet
  const existing = await bookingCollection.findOne({ vetId, userEmail });
  if (existing) {
    return Response.json({ success: false, message: "Already booked" });
  }

  await bookingCollection.insertOne({
    vetId,
    userEmail,
    bookedAt: new Date(),
  });

  return Response.json({ success: true, message: "Vet booked successfully" });
}
