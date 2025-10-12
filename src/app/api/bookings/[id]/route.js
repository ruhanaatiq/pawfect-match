import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/dbConnect";

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // extract ID from URL

    if (!id) return NextResponse.json({ error: "Booking ID required" }, { status: 400 });

    const bookingsCol = await getCollection("bookings");
    const vetsCol = await getCollection("vets");

    // Find the booking
    const booking = await bookingsCol.findOne({ _id: new ObjectId(id) });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Delete booking
    await bookingsCol.deleteOne({ _id: new ObjectId(id) });

    // Optional: free up vet status
    await vetsCol.updateOne(
      { _id: new ObjectId(booking.vetId) },
      { $set: { status: "available" }, $unset: { bookedBy: "", bookedAt: "" } }
    );

    return NextResponse.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
