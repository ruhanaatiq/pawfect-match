"use client"
import vets from '../../../public/vets.json'
import Link from 'next/link'
import React, { useState } from 'react'

export default function Vets() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVets = vets.filter((vet) =>
    vet.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredVets.length > 0 ? (
          filteredVets.map((vet) => (
            <div
              key={vet.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              {/* Vet Image */}
              <div className="relative w-full h-80">
                <img
                  src={vet.photo}
                  alt={vet.name}
                  className="h-80 w-full object-cover"
                />
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{vet.name}</h2>
                <p className="text-sm text-gray-600">
                  Specialties: {vet.specialties.join(', ')}
                </p>

                {/* View Details Button */}
                <div className="mt-3">
                  <Link
                    href={`/vets/${vet.id}`}
                    className="inline-block w-full text-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
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
  )
}
