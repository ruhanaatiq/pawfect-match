"use client";

import { useEffect, useState } from "react";

function PetCard({ p }) {
  const img = Array.isArray(p.images) && p.images.length ? p.images[0] : (p.image || "/placeholder-pet.jpg");
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure><img src={img} alt={p.name} className="h-56 w-full object-cover" /></figure>
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">{p.name}</h2>
          <span className="badge badge-primary text-white">{p.matchScore}% match</span>
        </div>
        <p className="text-sm opacity-80 capitalize">
          {p.species} • {p.breed || "Mixed"} • {p.size || "—"} • {p.age ?? "—"}y
        </p>
        {p.matchReasons?.length ? (
          <ul className="mt-2 text-sm list-disc list-inside">
            {p.matchReasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        ) : null}
        <div className="card-actions justify-end mt-4">
          <a href={`/pets/${p._id}`} className="btn btn-outline">View details</a>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("pm_prefs") || "{}");
    fetch("/api/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(prefs),
    })
      .then((r) => r.json())
      .then((j) => setRows(j.results || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Finding your matches…</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Matches</h1>
      {rows.length === 0 ? (
        <div className="alert">No pets found. Try adjusting your preferences.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => <PetCard key={p._id} p={p} />)}
        </div>
      )}
    </div>
  );
}