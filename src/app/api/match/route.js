// src/app/api/match/route.js
import { NextResponse } from "next/server";
import Pet from "@/models/Pets";
import { connectDB } from "@/lib/mongoose";
import { scorePetAgainstUser, normalizePrefs, isBusyBee } from "@/lib/match/score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(req) {
  const raw = await req.json(); // prefs from client
  const prefs = normalizePrefs(raw || {});
  await connectDB();

  // Build query (case-insensitive species match)
  const query = {};
  if (prefs.species !== "any") {
    query.species = { $regex: `^${escapeRegex(prefs.species)}$`, $options: "i" };
  }
  // Optional: only available pets
  // query.status = { $in: ["Available", "available"] };

  // Pull pets and rank
  const pets = await Pet.find(query).limit(200).lean();

  let ranked = pets
    .map((p) => {
      const { score, reasons } = scorePetAgainstUser(p, prefs);
      return {
        ...p,
        // normalize for your UI (PetCard uses p.name, p.age)
        _id: String(p._id),
        name: p.name ?? p.petName ?? "Unnamed",
        age: p.age ?? p.petAge ?? "—",
        matchScore: score,
        matchReasons: reasons,
        // quick image host fix if needed:
        images: Array.isArray(p.images)
          ? p.images.map((u) => (typeof u === "string" ? u.replace("i.ibb.co.com", "i.ibb.co") : u))
          : typeof p.images === "string"
          ? [p.images.replace("i.ibb.co.com", "i.ibb.co")]
          : (p.image ? [p.image] : []),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // Busy Bee fallback: if strict returns nothing, relax to species-only list (already done by query).
  if (!ranked.length && isBusyBee(prefs)) {
    // Try ignoring species entirely
    const anyPets = pets.length ? pets : await Pet.find({}).limit(50).lean();
    ranked = anyPets.map((p) => ({
      ...p,
      _id: String(p._id),
      name: p.name ?? p.petName ?? "Unnamed",
      age: p.age ?? p.petAge ?? "—",
      matchScore: 60,
      matchReasons: ["Closest available for Busy Bee"],
      images: Array.isArray(p.images)
        ? p.images.map((u) => (typeof u === "string" ? u.replace("i.ibb.co.com", "i.ibb.co") : u))
        : typeof p.images === "string"
        ? [p.images.replace("i.ibb.co.com", "i.ibb.co")]
        : (p.image ? [p.image] : []),
    }));
  }

  return NextResponse.json({ results: ranked });
}
