import { NextResponse } from "next/server";
import { getCollection } from "@/lib/dbConnect";

// POST: Add new sponsorship request
export async function POST(req) {
  try {
    const data = await req.json();
    const sponsorsCollection = await getCollection("sponsors");

    await sponsorsCollection.insertOne({
      ...data,
      status: "pending", // default status
      appliedAt: new Date(),
    });

    return NextResponse.json({ message: "Application saved" }, { status: 201 });
  } catch (error) {
    console.error("Error saving sponsor:", error);
    return NextResponse.json({ message: "Failed to save sponsor" }, { status: 500 });
  }
}

// GET: Fetch sponsor applications
export async function GET(req) {
  try {
    const sponsorsCollection = await getCollection("sponsors");

    // Optional: filter by email query param
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const query = email ? { email } : {};

    const applications = await sponsorsCollection
      .find(query)
      .sort({ appliedAt: -1 })
      .toArray();

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return NextResponse.json(
      { message: "Failed to fetch sponsor applications" },
      { status: 500 }
    );
  }
}
