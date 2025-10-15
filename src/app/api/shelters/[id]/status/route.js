// src/app/api/shelters/requests/[id]/route.js  (adjust path if different)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";
import { requireShelterAccess, respond } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["pending","under_review","approved","rejected","completed"]);

export async function PATCH(req, { params }) {
  await connectDB();

  // Load the request first to know the shelterId to guard against
  const ar = await AdoptionRequest.findById(params.id);
  if (!ar) return respond(404, { error: "Not found" });

  // Allow admins, or shelter members (owner/manager) of this shelter
  const g = await requireShelterAccess(ar.shelterId, { allowedRoles: ["owner","manager"] });
  if (g.response) return g.response;

  const { status, notes } = await req.json().catch(() => ({}));
  if (!ALLOWED.has(String(status))) {
    return respond(400, { error: "Invalid status" });
  }

  ar.status = status;
  if (typeof notes === "string") ar.notes = notes.trim();
  await ar.save();

  return NextResponse.json({ request: ar.toObject() });
}
