import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deleted = await AdoptionRequest.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    return NextResponse.json({ ok: true, message: "Application cancelled" });
  } catch (err) {
    console.error("Delete adoption error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
