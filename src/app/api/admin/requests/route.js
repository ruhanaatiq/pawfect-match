import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";
import Pet from "@/models/Pets";

export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("pageSize") || 10)));
  const status = searchParams.get("status"); // Pending | Approved | Rejected | (null = all)
  const q = searchParams.get("q")?.trim();

  const query = {};
  if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
    query.status = status;
  }
  if (q) {
    query.$or = [
      { petName: { $regex: q, $options: "i" } },
      { "applicant.fullName": { $regex: q, $options: "i" } },
      { "applicant.email": { $regex: q, $options: "i" } },
      { "applicant.phone": { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const total = await AdoptionRequest.countDocuments(query);
  const items = await AdoptionRequest.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  // optionally enrich with pet species/breed from Pets
  const petIds = Array.from(new Set(items.map((i) => String(i.petId))));
  const pets = await Pet.find({ _id: { $in: petIds } }, { species: 1, breed: 1 }).lean();
  const petMap = new Map(pets.map((p) => [String(p._id), p]));

  const data = items.map((i) => ({
    ...i,
    _id: String(i._id),
    petId: String(i.petId),
    pet: petMap.get(String(i.petId)) || null,
  }));

  return NextResponse.json({ total, page, pageSize, items: data });
}
