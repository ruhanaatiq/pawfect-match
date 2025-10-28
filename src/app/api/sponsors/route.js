// src/app/api/sponsors/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ GET: list sponsorship requests (filtered by email if provided)
export async function GET(req) {
  try {
    const sponsors = await getCollection("sponsors");
    const { searchParams } = new URL(req.url);

    const email  = searchParams.get("email");   // e.g. user@site.com
    const status = searchParams.get("status");  // optional
    const q      = searchParams.get("q");       // optional search

    const filter = {};
    if (email) filter.email = email; // ✅ fixed field name
    if (status && status !== "all") filter.status = status;
    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: "i" } },
        { companyName: { $regex: q, $options: "i" } },
      ];
    }

    const items = await sponsors.find(filter).sort({ appliedAt: -1 }).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/sponsors error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


// ✅ POST: create a new sponsorship request
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      website,
      logoUrl,
      message,
    } = body;

    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const sponsors = await getCollection("sponsors");

    const newSponsor = {
      companyName,
      contactName,
      email,
      phone,
      website,
      logoUrl,
      message,
      status: "pending",
      appliedAt: new Date(),
    };

    await sponsors.insertOne(newSponsor);

    return NextResponse.json(
      { success: true, message: "Sponsorship submitted successfully." },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/sponsors error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!["approved", "cancelled"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const sponsors = await getCollection("sponsors");

    const result = await sponsors.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("PATCH /api/sponsors/:id error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}