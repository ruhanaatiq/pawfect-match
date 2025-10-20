"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import categoriesData from "@/data/category.json";

const toKey = (v) =>
  String(v || "").trim().toLowerCase().replace(/\s+/g, " ");
const pickBreed = (p) =>
  String(
    p?.breed ??
      p?.petBreed ??
      p?.breedName ??
      p?.type ??
      p?.petType ??
      ""
  ).trim();

export default function CategoryPage() {
  const params = useParams();
  const category = String(params?.category || "").trim();

  const [selectedBreed, setSelectedBreed] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchPets() {
      try {
        setLoading(true);
        setFetchError("");

        // ask for available pets; server should have tolerant species filter
        const res = await fetch(
          `/api/pets?species=${encodeURIComponent(category)}&status=available`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Failed to load pets (${res.status})`);

        const data = await res.json();
        const raw = Array.isArray(data?.items) ? data.items : [];

        const normalized = raw.map((p, index) => {
          const id = String(p?._id ?? p?.id ?? p?.slug ?? `idx-${index}`);
          const cover = Array.isArray(p?.images)
            ? p.images.find(Boolean)
            : p?.images || p?.image;

          const breed = pickBreed(p);

          return {
            ...p,
            id,
            petName: (p?.petName || p?.name || "Friend").toString(),
            images: cover || "/placeholder.jpg",
            species: p?.species ?? p?.petCategory ?? "",
            petLocation: p?.petLocation ?? null,
            petAge: p?.petAge ?? p?.age ?? "",
            breed,
            _breedKey: toKey(breed), // for filtering
          };
        });

        if (!cancelled) setPets(normalized);
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching pets:", err);
          setFetchError(err?.message || "Error fetching pets");
          setPets([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPets();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category]);

  const allBreeds = useMemo(() => {
    const speciesObj = categoriesData?.categories?.[category]?.species || {};
    const list = Object.values(speciesObj).flat().map((b) => String(b).trim()).filter(Boolean);
    return Array.from(new Set(list));
  }, [category]);

  const filteredPets = useMemo(() => {
    if (!selectedBreed) return [];
    const needle = toKey(selectedBreed);
    return pets.filter((p) => p._breedKey === needle || p._breedKey.includes(needle));
  }, [pets, selectedBreed]);

  return (
    <div
      className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto"
      style={{ backgroundColor: "rgb(249, 242, 229)" }}
    >
      {/* Header */}
      <header className="mb-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Pawfect Match</h1>
            </div>
          </Link>
          <div className="bg-white rounded-full px-4 py-2 shadow-sm">
            <span className="text-gray-600">Find</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-3xl font-bold capitalize text-center text-gray-800">
            {category}
          </h2>
          <p className="text-center text-gray-600 mt-2">
            {!selectedBreed
              ? `Browse through our adorable ${category.toLowerCase()} breeds`
              : `Meet our lovely ${selectedBreed} ${category.toLowerCase()}s`}
          </p>
        </div>
      </header>

      {/* Loading */}
      {loading && <div className="text-center text-gray-600 py-20">Loading pets...</div>}

      {/* Error */}
      {!loading && fetchError && (
        <div className="text-center text-red-600 py-6">{fetchError}</div>
      )}

      {/* Breeds */}
      {!loading && !fetchError && !selectedBreed && (
        <div>
          <h3 className="text-xl font-semibold mb-6 text-center text-gray-700">
            Select a Breed
          </h3>

          {allBreeds.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {allBreeds.map((breed) => (
                <button
                  key={breed}
                  type="button"
                  className="bg-white rounded-xl p-5 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-gray-100 flex flex-col items-center w-full"
                  onClick={() => setSelectedBreed(breed)}
                >
                  <div
                    className="w-16 h-16 rounded-full mb-3 flex items-center justify-center"
                    style={{ backgroundColor: "rgb(255, 219, 90)" }}
                  >
                    <span className="text-white text-2xl">🐾</span>
                  </div>
                  <h3 className="text-lg font-semibold text-center text-gray-800">
                    {breed}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    View available pets
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-white shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No breeds configured
              </h3>
              <p className="text-gray-600">
                We couldn’t find any breeds for {category.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pets of Selected Breed */}
      {!loading && !fetchError && selectedBreed && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 rounded-xl bg-white shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
              Available <span className="text-amber-500">{selectedBreed}</span>{" "}
              {category.toLowerCase()}
            </h3>
            <button
              onClick={() => setSelectedBreed(null)}
              className="px-4 py-2 rounded-full transition-colors flex items-center"
              style={{ backgroundColor: "rgb(255, 219, 90)", color: "#333" }}
            >
              <span className="mr-2">←</span> Back to Breeds
            </button>
          </div>

          {filteredPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredPets.map((pet) => (
                <div
                  key={pet.id} /* key on the top node */
                  className="bg-white border rounded-xl p-4 shadow-md transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  <div className="overflow-hidden rounded-xl mb-4 h-48 flex items-center justify-center bg-gray-100 relative">
                    <img
                      src={pet.images}
                      alt={pet.petName}
                      className="w-full h-full object-cover"
                    />
                    {pet.petAge ? (
                      <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {pet.petAge}
                      </div>
                    ) : null}
                  </div>

                  <h4 className="font-bold text-xl mb-2 text-gray-800">
                    {pet.petName}
                  </h4>

                  <div className="flex items-center text-gray-600 mb-4">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{pet?.petLocation?.city ?? "—"}</span>
                  </div>

                  <Link
                    href={`/pets/${pet.id}`}
                    className="inline-block w-full text-center px-4 py-3 rounded-xl transition-colors font-semibold"
                    style={{ backgroundColor: "rgb(255, 219, 90)", color: "#333" }}
                  >
                    Meet {pet.petName}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-white shadow-md">
              <div
                className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgb(255, 219, 90)" }}
              >
                <span className="text-4xl">🐕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No pets found
              </h3>
              <p className="text-gray-600 mb-6">
                We don't have any {selectedBreed} {category.toLowerCase()}s available right now.
              </p>
              <button
                onClick={() => setSelectedBreed(null)}
                className="px-6 py-2 rounded-full transition-colors inline-flex items-center"
                style={{ backgroundColor: "rgb(255, 219, 90)", color: "#333" }}
              >
                <span className="mr-2">←</span> Browse other breeds
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-600">
        <p>
          © {new Date().getFullYear()} Pawfect Match. Find your perfect pet
          companion.
        </p>
      </footer>
    </div>
  );
}
