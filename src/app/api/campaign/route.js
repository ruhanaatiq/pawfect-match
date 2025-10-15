import { getCollection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const campaignsCollection = await getCollection("campaigns");
    const campaigns = await campaignsCollection.find({}).toArray();
    return NextResponse.json(campaigns);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
