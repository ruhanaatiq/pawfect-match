import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import  Campaign from "@/models/Campaign"; // your Mongoose model

export async function GET() {
  await connectDB();
  const items = await Campaign.find({}).sort({ createdAt: -1 }).lean();

  const campaigns = items.map((c) => ({
    _id: String(c._id),
    title: c.title,
    description: c.description,
    status: c.status,
    createdAt: c.createdAt,
    targetAmount: c.goal,   
    raisedAmount: c.raised,
    petId: String(c.petId),
  }));

  return NextResponse.json({ campaigns });
}
