// App Router page: /adopt/request/:id
import { connectDB } from "@/lib/mongoose";
import Pet from "@/models/Pets";
import RequestForm from "./request-form";

export const dynamic = "force-dynamic";

export default async function RequestAdoptionPage({ params }) {
  await connectDB();
  const pet = await Pet.findById(params.id).lean();

  if (!pet) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-red-600">Pet not found</h1>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#4C3D3D]">
          Adoption Request for {pet.petName || pet.name}
        </h1>
        <p className="text-[#4C3D3D]/70">
          Please complete the form. Our team/shelter will review and contact you.
        </p>
      </header>

      <section className="rounded-2xl border border-black/5 bg-white/80 p-4 mb-6 flex gap-4">
        <img
          src={Array.isArray(pet.images) ? pet.images[0] : pet.images}
          alt={pet.petName || pet.name}
          className="w-28 h-28 object-cover rounded-xl bg-gray-100"
        />
        <div className="text-sm text-[#4C3D3D]">
          <div className="font-semibold">{pet.petName || pet.name}</div>
          <div className="text-[#4C3D3D]/70">{pet.breed} • {pet.gender} • {pet.petAge || pet.age}</div>
          {pet.vaccinationStatus && (
            <div className="mt-1">Vaccination: <b>{pet.vaccinationStatus}</b></div>
          )}
          {pet.healthCondition && (
            <div>Health: <b>{pet.healthCondition}</b></div>
          )}
        </div>
      </section>

      <RequestForm petId={String(pet._id)} />
    </main>
  );
}
