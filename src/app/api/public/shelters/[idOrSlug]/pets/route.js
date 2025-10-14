// src/app/api/public/shelters/[idOrSlug]/pets/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import Pet from "@/models/Pets";
import mongoose from "mongoose";

const ALLOWED = (process.env.PUBLIC_SHELTER_STATUSES || "verified,accepted,approved,active")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

export async function GET(req, { params }) {
  await connectDB();

  const url = new URL(req.url);
  const species = url.searchParams.get("species") || "";
  const vaccinated = url.searchParams.get("vaccinated") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const pageSize = 12;

  const { idOrSlug } = params;
  const isId = mongoose.Types.ObjectId.isValid(idOrSlug);

  const baseShelter = { $or: [{ status: { $in: ALLOWED } }, { status: { $exists: false } }] };
  const matchShelter = isId ? { _id: idOrSlug } : { publicSlug: idOrSlug };
  const shelter = await Shelter.findOne({ ...baseShelter, ...matchShelter }).select("_id").lean();
  if (!shelter) return NextResponse.json({ items: [], total: 0, page, pageSize });

  const petFilter = { shelter: shelter._id, status: { $in: ["available", "active", "listed"] } };
  if (species) petFilter.species = species;
  if (vaccinated === "true") petFilter.vaccinated = true;
  if (vaccinated === "false") petFilter.vaccinated = false;

  const [items, total] = await Promise.all([
    Pet.find(petFilter)
      .select("_id name species gender size images photos vaccinated createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Pet.countDocuments(petFilter),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
