import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";

// DELETE — cancel adoption
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deleted = await AdoptionRequest.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "Application not found" }, { status: 404 });

    return NextResponse.json({ ok: true, message: "Application cancelled" });
  } catch (err) {
    console.error("Delete adoption error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH — approve adoption
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    await AdoptionRequest.findByIdAndUpdate(id, {
      status: "approved",
      notified: false, // for notification tracking
    });

    return NextResponse.json({ ok: true, message: "Adoption approved successfully" });
  } catch (err) {
    console.error("Approve adoption error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
