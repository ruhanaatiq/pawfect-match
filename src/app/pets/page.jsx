import React from "react";
import pets from "../../../public/pets.json";
import Link from "next/link";

export default async function AllPets() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        All Pets: {pets.length}
      </h1>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
          >
            {/* Pet Image */}
            <div className="relative w-full h-60">
              <img
                src={pet.images}
                alt={pet.petName}
                className="h-60 w-full"
              />
            </div>

            {/* Card Content */}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {pet.petName}
              </h2>
              <p className="text-sm text-gray-600">Age: {pet.petAge}</p>
              <p className="text-sm text-gray-600">
                Location: {pet.petLocation.city}, {pet.petLocation.area}
              </p>

              {/* View Details Button */}
              <div className="mt-3">
                <Link
                  href={`/pets/${pet.id}`}
                  className="inline-block w-full text-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
