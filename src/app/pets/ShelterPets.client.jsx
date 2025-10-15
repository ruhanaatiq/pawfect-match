"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function ShelterPetsClient({ shelterId }) {
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState({}); // id → true

  useEffect(() => {
    if (!shelterId) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/pets?shelter=${encodeURIComponent(shelterId)}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) {
          throw new Error(json?.error || `HTTP ${res.status}`);
        }

        const raw = Array.isArray(json.items)
          ? json.items
          : Array.isArray(json.data)
          ? json.data
          : [];

        const shaped = raw.map((p) => {
          const mainImage = Array.isArray(p.images)
            ? p.images[0] || "/placeholder-pet.jpg"
            : p.image || p.images || "/placeholder-pet.jpg";

          return {
            id: p._id?.toString?.() ?? p.id ?? "",
            name: p.petName ?? p.name ?? "Unnamed",
            age: p.petAge ?? p.age ?? "Unknown",
            species: p.species ?? "",
            status: (p.status || "available").toLowerCase(),
            location: p.location || p.petLocation || {},
            image: mainImage,
          };
        });

        setPets(shaped);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Failed to fetch pets");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [shelterId]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return pets;
    return pets.filter(
      (p) => p.name.toLowerCase().includes(q) || p.species.toLowerCase().includes(q)
    );
  }, [pets, searchTerm]);

  async function onDelete(id) {
    if (!id) return;
    if (!confirm("Delete this pet?")) return;

    setDeleting((d) => ({ ...d, [id]: true }));
    const prev = pets.slice(); // ✅ snapshot

    try {
      // optimistic UI
      setPets((list) => list.filter((p) => p.id !== id));

      const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }
    } catch (e) {
      alert(e.message || "Delete failed");
      setPets(prev); // revert
    } finally {
      setDeleting((d) => ({ ...d, [id]: false }));
    }
  }

  if (loading) return <div>Loading pets…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or species…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="text-sm text-gray-600">Total: {pets.length}</div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-600">No pets found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="relative w-full h-64">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pet.image} alt={pet.name} className="h-64 w-full object-cover" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">{pet.name}</h2>
                  <span className="text-xs rounded-full px-2 py-0.5 ring-1 ring-gray-200">
                    {pet.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Age: {pet.age}</p>
                <p className="text-sm text-gray-600">
                  {pet.location?.city || "Unknown"}
                  {pet.location?.area ? `, ${pet.location.area}` : ""}
                </p>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/pets/${pet.id}`}
                    className="flex-1 text-center bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition text-sm"
                  >
                    View
                  </Link>
                  <Link
                    href={`/pets/${pet.id}/edit`}
                    className="flex-1 text-center border px-3 py-2 rounded-lg hover:bg-emerald-50 transition text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(pet.id)}
                    disabled={!!deleting[pet.id]}
                    className="text-sm rounded-lg border px-3 py-2 hover:bg-rose-50 text-rose-700 disabled:opacity-60"
                    title="Delete pet"
                  >
                    {deleting[pet.id] ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
