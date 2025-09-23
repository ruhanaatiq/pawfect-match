"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function AllPets() {
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await fetch("/api/pets");
      const result = await response.json();

      if (result.success) {
        // Normalize MongoDB docs
        const shaped = result.data.map((p) => ({
          id: p._id?.toString() ?? p.id, // use _id as id
          petName: p.petName ?? "Unnamed",
          petAge: p.petAge ?? "Unknown",
          petLocation: p.petLocation ?? {},
          images: Array.isArray(p.images)
            ? p.images[0] ?? "/placeholder-pet.jpg"
            : p.images ?? "/placeholder-pet.jpg",
        }));
        setPets(shaped);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch pets");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter pets by name (case-insensitive)
  const filteredPets = pets.filter((pet) =>
    pet.petName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading pets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        All Pets: {filteredPets.length}
      </h1>

      {/* Search Bar */}
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
              {/* Pet Image */}
              <div className="relative w-full h-80">
                <img
                  src={pet.images}
                  alt={pet.petName}
                  className="h-80 w-full object-cover"
                />
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {pet.petName}
                </h2>
                <p className="text-sm text-gray-600">Age: {pet.petAge}</p>
                <p className="text-sm text-gray-600">
                  Location:{" "}
                  {pet.petLocation?.city ?? "Unknown"},{" "}
                  {pet.petLocation?.area ?? ""}
                </p>

                {/* View Details Button */}
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
