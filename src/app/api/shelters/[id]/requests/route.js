import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";
import { requireSession, requireShelterRole, json } from "@/lib/guard";

export async function GET(_req, { params }) {
  const session = await requireSession();
  const { assert } = await requireShelterRole(params.id, ["owner","manager","staff"]);
  assert(session.user._id);

  await connectDB();
  const requests = await AdoptionRequest.find({ shelterId: params.id })
    .populate("petId","name photos")
    .populate("adopterId","name email")
    .sort({ createdAt: -1 })
    .lean();
  return json({ requests });
}
