import { getCollection } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// GET campaign by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const campaignsCollection = await getCollection("campaigns");
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });

    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    return NextResponse.json(campaign);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

// POST donation / participation
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { amount, participantName, participantEmail } = body;

    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const campaignsCollection = await getCollection("campaigns");

    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    // Update raisedAmount & add participant
    const updated = await campaignsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { raisedAmount: amount },
        $push: { participants: { name: participantName, email: participantEmail, amount, date: new Date() } }
      }
    );

    return NextResponse.json({ success: true, message: "Donation successful" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 });
  }
}
