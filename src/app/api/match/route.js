import { NextResponse } from "next/server";
import Pet from "@/models/Pets";
import { connectDB } from "@/lib/mongoose";
import { scorePetAgainstUser } from "@/lib/match/score";

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json(); // prefs
  const prefs = body || {};
  await connectDB();

  const query = {};
  if (prefs.speciesPref && prefs.speciesPref !== "any") {
    query.species = prefs.speciesPref;
  }

  const pets = await Pet.find(query).limit(200).lean();

  const ranked = pets.map((p) => {
    const { score, reasons } = scorePetAgainstUser(p, prefs);
    return {
      ...p,
      _id: String(p._id),
      matchScore: score,
      matchReasons: reasons,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({ results: ranked });
}
