import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";
import Pet from "@/models/Pets";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      petId, fullName, email, phone, city,
      homeType, hasOtherPets, message
    } = body || {};

    if (!petId || !fullName || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pet = await Pet.findById(petId).lean();
    if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

    const doc = await AdoptionRequest.create({
      petId,
      petName: pet.petName || pet.name,
      applicant: { fullName, email, phone, city },
      household: { homeType, hasOtherPets: !!hasOtherPets },
      message: message || "",
      status: "Pending",
    });

    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (err) {
    console.error("Adoption POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
