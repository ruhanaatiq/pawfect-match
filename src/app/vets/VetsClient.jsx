"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function VetsClient({ vets }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState(""); // initially no sort
  const [loading, setLoading] = useState(true);

  // Loading spinner simulation (optional if data fetch async)
  useEffect(() => {
    if (vets) {
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [vets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter by search
  const filteredVets = vets.filter((vet) =>
    vet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sort only if user selected an option
  const sortedVets =
    sortOption === ""
      ? filteredVets // default: mongo order
      : [...filteredVets].sort((a, b) => {
          if (sortOption === "name") return a.name.localeCompare(b.name);
          if (sortOption === "experience")
            return (b.experienceYears || 0) - (a.experienceYears || 0);
          if (sortOption === "rating")
            return (b.averageRating || 0) - (a.averageRating || 0);
          return 0;
        });

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        All Vets: {sortedVets.length}
      </h1>

      {/* Search + Sort Bar */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by vet name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F8E7B6]"
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F8E7B6]"
        >
          <option value="">Default</option>
          <option value="name">Sort by Name</option>
          <option value="experience">Sort by Experience</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedVets.length > 0 ? (
          sortedVets.map((vet) => (
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
                <p className="text-sm text-gray-600">
                  Experience: {vet.experienceYears || "N/A"} yrs
                </p>
                <p className="text-sm text-gray-600">
                  Rating: ⭐ {vet.averageRating || "N/A"}
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
