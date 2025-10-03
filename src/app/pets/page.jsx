"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
//import dbConnect from "@/lib/dbConnect";

export default function AllPets() {
  
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/pets", { cache: "no-store", signal: ac.signal });
        const result = await res.json().catch(() => ({}));

        if (!res.ok || result.success === false) {
          throw new Error(result?.error || `HTTP ${res.status}`);
        }

        // Prefer canonical 'items', fallback to legacy 'data'
        const list = Array.isArray(result.items)
          ? result.items
          : Array.isArray(result.data)
          ? result.data
          : [];

        const shaped = list.map((p) => {
          const mainImage = Array.isArray(p.images)
            ? p.images[0] || "/placeholder-pet.jpg"
            : p.image || p.images || "/placeholder-pet.jpg";

          return {
            id: p._id?.toString?.() ?? p.id ?? "",
            petName: p.petName ?? p.name ?? "Unnamed",
            petAge: p.petAge ?? p.age ?? "Unknown",
            petLocation: p.petLocation ?? p.location ?? {},
            image: mainImage,
          };
        });

        setPets(shaped);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Failed to fetch pets");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const filteredPets = useMemo(
    () => pets.filter((pet) => pet.petName.toLowerCase().includes(searchTerm.toLowerCase())),
    [pets, searchTerm]
  );

  if (loading) return <div>Loading pets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        All Pets: {filteredPets.length}
      </h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by pet name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredPets.length > 0 ? (
          filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="relative w-full h-80">
                <img src={pet.image} alt={pet.petName} className="h-80 w-full object-cover" />
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{pet.petName}</h2>
                <p className="text-sm text-gray-600">Age: {pet.petAge}</p>
                <p className="text-sm text-gray-600">
                  Location: {pet.petLocation?.city ?? "Unknown"}
                  {pet.petLocation?.area ? `, ${pet.petLocation.area}` : ""}
                </p>

                <div className="mt-3">
                  <Link
                    href={`/pets/${pet.id}`}
                    className="inline-block w-full text-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No pets found matching your search.
          </p>
        )}
      </div>
    </div>
  );
}
