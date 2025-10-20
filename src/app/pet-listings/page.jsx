// src/app/pet-listings/page.jsx
export const revalidate = 60;

import AvailablePetsCard from "@/components/AvailablePetsCard";

async function loadPets(searchParams) {
  const qs = new URLSearchParams({
    status: "available",
    q: searchParams?.q || "",
    species: searchParams?.species || "",
    limit: "12",
    page: searchParams?.page || "1",
  });
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pets?` + qs, {
    next: { revalidate: 60 },
    cache: "force-cache",
  });
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
}

export default async function PetListingsPage({ searchParams }) {
  const pets = await loadPets(searchParams);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Pets</h1>

      {pets.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <AvailablePetsCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-10 text-center shadow">
          No pets available right now. Please check back soon!
        </div>
      )}
    </main>
  );
}
