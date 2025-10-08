import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";
import { requireSession, requireShelterRole, json } from "@/lib/guard";

export async function PATCH(req, { params }) {
  const session = await requireSession();
  await connectDB();
  const ar = await AdoptionRequest.findById(params.id);
  if (!ar) return json({ error: "Not found" }, 404);

  const { assert } = await requireShelterRole(ar.shelterId, ["owner","manager"]);
  assert(session.user._id);

  const { status, notes } = await req.json();
  if (!["pending","under_review","approved","rejected","completed"].includes(status))
    return json({ error: "Invalid status" }, 400);

  ar.status = status;
  if (notes) ar.notes = notes;
  await ar.save();
  return json({ request: ar.toObject() });
}
