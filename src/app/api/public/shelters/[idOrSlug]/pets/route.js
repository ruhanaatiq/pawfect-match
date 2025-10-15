import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import Pet from "@/models/Pets";           // ⚠️ ensure the file name is Pet, not Pets
import mongoose from "mongoose";

const PUBLIC_STATUSES = (process.env.PUBLIC_PET_STATUSES || "available,listed,active")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

export async function GET(req, { params }) {
  await connectDB();

  const { idOrSlug } = params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(searchParams.get("pageSize") || 12)));
  const species = (searchParams.get("species") || "").trim();     // "", "Dog", "Cat", etc
  const vaccinated = searchParams.get("vaccinated");              // "", "true", "false"

  // Find shelter by slug OR id
  const isId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const shelter = await Shelter.findOne(isId ? { _id: idOrSlug } : { publicSlug: idOrSlug }).lean();
  if (!shelter) return NextResponse.json({ error: "Shelter not found" }, { status: 404 });

  const filter = {
    shelter: shelter._id,
    // show only public pets
    $or: [{ status: { $in: PUBLIC_STATUSES } }, { status: { $exists: false } }, { status: "" }, { status: null }],
  };
  if (species) filter.species = species;
  if (vaccinated === "true") filter.vaccinated = true;
  if (vaccinated === "false") filter.vaccinated = false;

  const [items, total] = await Promise.all([
    Pet.find(filter)
      .select("_id name species gender size age vaccinated images photos status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Pet.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
