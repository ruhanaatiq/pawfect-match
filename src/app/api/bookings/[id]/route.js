import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/dbConnect";
import { auth } from "@/auth"; // or getServerSession if that's what you use

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const bookingsCol = await getCollection("bookings");
    const vetsCol = await getCollection("vets");

    // Find the booking
    const booking = await bookingsCol.findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only the owner (or an admin) can cancel
    const isAdmin = ["admin", "superadmin"].includes(session?.user?.role);
    if (!isAdmin && booking.userEmail !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete booking
    await bookingsCol.deleteOne({ _id: new ObjectId(id) });

    // Optional: free up vet status (handle both string/ObjectId vetId)
    if (booking.vetId) {
      const vetFilter = ObjectId.isValid(booking.vetId)
        ? { _id: new ObjectId(booking.vetId) }
        : { _id: booking.vetId };

      await vetsCol.updateOne(
        vetFilter,
        { $set: { status: "available" }, $unset: { bookedBy: "", bookedAt: "" } }
      );
    }

    return NextResponse.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
