import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Pet from "@/models/Pets";          // adjust name if your file is Pet.js
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function parseBool(q) {
  if (q == null || q === "") return undefined;
  const s = String(q).toLowerCase();
  if (["1","true","yes"].includes(s)) return true;
  if (["0","false","no"].includes(s)) return false;
  return undefined;
}

export async function GET(req, { params }) {
  await connectDB();

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 12) || 12));
  const species = (url.searchParams.get("species") || "").trim();
  const vaccinated = parseBool(url.searchParams.get("vaccinated"));

  const id = params.id;
  const asObj = mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;

  // accept multiple schema shapes for the shelter reference
  const shelterMatch = {
    $or: [
      ...(asObj ? [{ shelter: asObj }, { shelterId: asObj }, { "shelter._id": asObj }] : []),
      { shelter: id }, { shelterId: id }, { "shelter._id": id },
    ],
  };

  // adoptable statuses (tolerant)
  const statusMatch = { status: { $in: ["available", "active", "listed"] } };

  const filter = { ...shelterMatch, ...statusMatch };

  if (species) {
    const re = new RegExp(`^${species}$`, "i");
    filter.$or = [...(filter.$or || []), { species: re }, { type: re }, { petType: re }];
  }
  if (vaccinated !== undefined) filter.vaccinated = vaccinated;

  const q = Pet.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const [items, total] = await Promise.all([q.exec(), Pet.countDocuments(filter)]);

  return NextResponse.json({
    items: items.map((p) => ({
      _id: p._id,
      name: p.name || p.petName || "Friend",
      species: p.species || p.type || p.petType || "",
      gender: p.gender || "",
      size: p.size || "",
      vaccinated: !!p.vaccinated,
      images: Array.isArray(p.images) ? p.images
            : p.images ? [p.images]
            : Array.isArray(p.photos) ? p.photos
            : p.photos ? [p.photos] : [],
      status: p.status || "",
    })),
    total,
    page,
    pageSize: limit,
  });
}
