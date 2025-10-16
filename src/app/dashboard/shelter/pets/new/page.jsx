"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Simple breed catalog for suggestions
const BREEDS = {
  Dog: [
    "Mixed", "Labrador Retriever", "German Shepherd", "Golden Retriever",
    "Pug", "Siberian Husky", "Beagle", "Rottweiler", "Bulldog", "Pomeranian",
  ],
  Cat: [
    "Mixed", "Persian", "Siamese", "Maine Coon", "Bengal",
    "British Shorthair", "Ragdoll", "Scottish Fold", "Sphynx",
  ],
  Rabbit: ["Mixed", "Mini Lop", "Holland Lop", "Netherland Dwarf"],
  Bird: ["Mixed", "Parakeet", "Cockatiel", "Lovebird", "Budgerigar"],
  Other: ["Mixed"],
};

export default function NewPetPage() {
  const r = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // local state just for species→breed suggestions & breed field
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");

  const breedOptions = useMemo(() => BREEDS[species] || [], [species]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name")?.toString().trim(),
      species: fd.get("species")?.toString(),
      gender: fd.get("gender")?.toString() || "",
      size: fd.get("size")?.toString() || "",
      age: fd.get("age")?.toString().trim() || "",
      breed: fd.get("breed")?.toString().trim() || "", // ← include breed
      vaccinated: fd.get("vaccinated") === "on",
      images: (fd.get("images") || "")
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: fd.get("description")?.toString().trim() || "",
    };

    const res = await fetch("/api/shelters/mine/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || `Create failed (${res.status})`);
      return;
    }

    // const { pet } = await res.json(); // if you want the id
    r.push("/dashboard/shelter/pets");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Add New Pet</h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Name *</span>
          <input name="name" required className="rounded-xl border px-3 py-2" />
        </label>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Species *</span>
            <select
              name="species"
              required
              className="rounded-xl border px-3 py-2"
              value={species}
              onChange={(e) => {
                setSpecies(e.target.value);
                // keep user-typed breed; optionally reset:
                // setBreed("");
              }}
            >
              <option value="">Select…</option>
              <option>Dog</option>
              <option>Cat</option>
              <option>Rabbit</option>
              <option>Bird</option>
              <option>Other</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Gender</span>
            <select name="gender" className="rounded-xl border px-3 py-2">
              <option value="">—</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Size</span>
            <select name="size" className="rounded-xl border px-3 py-2">
              <option value="">—</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Age</span>
            <input name="age" placeholder="2 years" className="rounded-xl border px-3 py-2" />
          </label>

          {/* Breed with suggestions */}
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Breed</span>
            <input
              name="breed"
              className="rounded-xl border px-3 py-2"
              list="breed-list"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder={(breedOptions[0] || "Breed") + " (suggested)"}
            />
            <datalist id="breed-list">
              {breedOptions.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" name="vaccinated" className="h-4 w-4" />
            <span className="text-sm text-gray-700">Vaccinated</span>
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Image URLs (comma-separated)</span>
          <input
            name="images"
            placeholder="https://.../a.jpg, https://.../b.jpg"
            className="rounded-xl border px-3 py-2"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Description</span>
          <textarea name="description" rows={4} className="rounded-xl border px-3 py-2" />
        </label>

        <div className="flex gap-2">
          <button
            disabled={pending}
            className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save Pet"}
          </button>
        </div>
      </form>
    </div>
  );
}
