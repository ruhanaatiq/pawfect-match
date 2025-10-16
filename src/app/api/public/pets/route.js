// app/api/public/pets/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Pet from "@/models/Pet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const shelterId = searchParams.get("shelter");
  const species = searchParams.get("species");
  const gender = searchParams.get("gender");

  const q = { status: "available" };
  if (shelterId) q.shelterId = shelterId;
  if (species && species !== "all") q.species = species;
  if (gender && gender !== "any") q.gender = gender;

  const docs = await Pet.find(q).sort({ createdAt: -1 }).limit(60).lean();
  const items = docs.map((p) => ({
    id: String(p._id),
    name: p.petName ?? p.name ?? "Friend",
    species: p.species ?? p.petCategory ?? "",
    gender: p.gender ?? "",
    age: p.petAge ?? p.age ?? "",
    image: Array.isArray(p.images)
      ? p.images[0] || "/placeholder-pet.jpg"
      : p.images || "/placeholder-pet.jpg",
  }));

  return NextResponse.json({ items });
}
