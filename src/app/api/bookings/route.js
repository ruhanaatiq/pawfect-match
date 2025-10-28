

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const data = await req.json();
    const { vetId, userEmail, userName, vetName, vetPhoto, specialty, consultationFee } = data;

    if (!vetId || !userEmail)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const bookingsCol = await getCollection("bookings");

    // ✅ Prevent the same user from booking the same vet twice
    const existing = await bookingsCol.findOne({ vetId, userEmail });
    if (existing) {
      return NextResponse.json(
        { error: "You already booked this vet." },
        { status: 409 }
      );
    }

    // ✅ Create booking (allow other users to book same vet)
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
