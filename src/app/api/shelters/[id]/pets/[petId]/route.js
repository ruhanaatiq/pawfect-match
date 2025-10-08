import { connectDB } from "@/lib/mongoose";
import Pet from "@/models/Pet";
import { requireSession, requireShelterRole, json } from "@/lib/guard";

export async function PATCH(req, { params }) {
  const session = await requireSession();
  await connectDB();
  const pet = await Pet.findById(params.petId);
  if (!pet) return json({ error: "Not found" }, 404);

  const { assert } = await requireShelterRole(pet.shelterId, ["owner","manager","staff"]);
  assert(session.user._id);

  const patch = await req.json();
  Object.assign(pet, patch);
  await pet.save();
  return json({ pet: pet.toObject() });
}

export async function DELETE(_req, { params }) {
  const session = await requireSession();
  await connectDB();
  const pet = await Pet.findById(params.petId);
  if (!pet) return json({ error: "Not found" }, 404);
  const { assert } = await requireShelterRole(pet.shelterId, ["owner","manager"]);
  assert(session.user._id);

  await Pet.deleteOne({ _id: pet._id });
  return json({ ok: true });
}
