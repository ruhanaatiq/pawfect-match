import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/dbConnect";


export async function POST(req) {
  try {
    const data = await req.json();
    const { vetId, userEmail, userName, vetName, vetPhoto, specialty, consultationFee } = data;

    if (!vetId || !userEmail)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const vetsCol = await getCollection("vets");
    const bookingsCol = await getCollection("bookings");

    // ✅ Update vet status (only if not already booked)
    const updateRes = await vetsCol.updateOne(
      { _id: new ObjectId(vetId), status: { $ne: "booked" } },
      {
        $set: {
          status: "booked",
          bookedBy: userEmail,
          bookedAt: new Date(),
        },
      }
    );

    if (updateRes.matchedCount === 0)
      return NextResponse.json({ error: "Vet not found" }, { status: 404 });
    if (updateRes.modifiedCount === 0)
      return NextResponse.json({ error: "Vet already booked" }, { status: 409 });

    // ✅ Create booking
    const bookingDoc = {
      vetId,
      vetName,
      vetPhoto,
      specialty,
      consultationFee,
      userEmail,
      userName,
      status: "booked",
      bookingDate: new Date(),
      createdAt: new Date(),
    };

    const insertRes = await bookingsCol.insertOne(bookingDoc);
    return NextResponse.json({ success: true, id: insertRes.insertedId });
  } catch (err) {
    console.error("Error creating booking:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const bookingsCol = await getCollection("bookings");
    const bookings = await bookingsCol.find({ userEmail: email }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
