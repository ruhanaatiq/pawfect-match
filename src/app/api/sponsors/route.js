// src/app/api/sponsors/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** List sponsor requests.
 *  - /api/sponsors                -> all (admin)
 *  - /api/sponsors?email=foo@bar  -> filter by email (user)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || null;

    const sponsors = await getCollection("sponsors");
    const query = email ? { $or: [{ email }, { userEmail: email }] } : {};
    const data = await sponsors.find(query).sort({ appliedAt: -1 }).toArray();

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error("GET /api/sponsors error:", err);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}

// Optional but nice: preflight handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Keep your existing POST exactly as you have it
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      companyName = "",
      contactName = "",
      email = "",
      phone = "",
      website = "",
      logoUrl = "",
      message = "",
    } = body || {};

    if (!companyName || !contactName || !email || !phone) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const sponsors = await getCollection("sponsors");
    const doc = {
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

    const { insertedId } = await sponsors.insertOne(doc);
    return NextResponse.json({ success: true, id: insertedId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sponsors error:", err);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
