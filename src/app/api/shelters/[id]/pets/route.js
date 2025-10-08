import { connectDB } from "@/lib/mongoose";
import Pet from "@/models/Pet";
import { requireSession, requireShelterRole, json } from "@/lib/guard";

export async function GET(_req, { params }) {
  const session = await requireSession();
  const { assert } = await requireShelterRole(params.id, ["owner","manager","staff"]);
  assert(session.user._id);

  await connectDB();
  const pets = await Pet.find({ shelterId: params.id }).sort({ createdAt: -1 }).lean();
  return json({ pets });
}

export async function POST(req, { params }) {
  const session = await requireSession();
  const { assert } = await requireShelterRole(params.id, ["owner","manager","staff"]);
  assert(session.user._id);

  await connectDB();
  const data = await req.json();
  const pet = await Pet.create({ ...data, shelterId: params.id });
  return json({ pet: pet.toObject() }, 201);
}
