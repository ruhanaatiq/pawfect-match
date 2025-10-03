// src/app/vets/VetsClient.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function VetsClient({ vets }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVets = vets.filter((vet) =>
    vet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        All Vets: {filteredVets.length}
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by vet name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F8E7B6]"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredVets.length > 0 ? (
          filteredVets.map((vet) => (
            <div
              key={vet._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="relative w-full h-80">
                <img
                  src={vet.photo}
                  alt={vet.name}
                  className="h-80 w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{vet.name}</h2>
                <p className="text-sm text-gray-600">
                  Specialties: {vet.specialties?.join(", ")}
                </p>
                <div className="mt-3">
                  <Link
                    href={`/vets/${vet._id}`}
                    className="inline-block w-full text-center bg-[#f9d66f] px-4 py-2 rounded-lg hover:bg-[#f8d056] transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No vets found matching your search.
          </p>
        )}
      </div>
    </div>
  );
}
