import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import { requireSession, requireShelterRole, json } from "@/lib/guard";

export async function GET(_req, { params }) {
  const session = await requireSession();
  const { shelter } = await requireShelterRole(params.id, ["owner","manager","staff"]);
  // ensure member
  const isMember = shelter.members.some(m => String(m.userId) === String(session.user._id));
  if (!isMember) return new Response("Forbidden", { status: 403 });
  return json({ shelter });
}

export async function PATCH(req, { params }) {
  const session = await requireSession();
  const { assert } = await requireShelterRole(params.id, ["owner","manager"]);
  assert(session.user._id);

  await connectDB();
  const patch = await req.json();
  const s = await Shelter.findByIdAndUpdate(params.id, patch, { new: true }).lean();
  return json({ shelter: s });
}
