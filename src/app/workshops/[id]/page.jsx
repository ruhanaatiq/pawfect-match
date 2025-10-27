"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function WorkshopDetailsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState({}); // track joined workshops

  // Load joined workshops from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("joinedWorkshops");
    if (stored) setJoined(JSON.parse(stored));
  }, []);

  useEffect(() => {
    async function fetchWorkshops() {
      try {
        const res = await fetch("/api/workshops");
        if (!res.ok) throw new Error("Failed to fetch workshops");
        const data = await res.json();
        setWorkshops(data);
      } catch (e) {
        console.error(e);
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkshops();
  }, []);

  const handleJoin = (id, title) => {
    setJoined((prev) => {
      const updated = { ...prev, [id]: true };
      localStorage.setItem("joinedWorkshops", JSON.stringify(updated));
      toast.success(`Joined ${title}!`);
      return updated;
    });
  };

  if (loading) return <p className="p-6">Loading workshops...</p>;
  if (!workshops.length) return <p className="p-6">No workshops available.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {workshops.map((workshop) => (
        <div
          key={workshop.id}
          className="p-4 border rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center"
        >
          <img
            src={workshop.bgImage}
            alt={workshop.title}
            className="w-full md:w-60 h-40 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{workshop.title}</h2>
            <p>Date: {new Date(workshop.date).toLocaleDateString()}</p>
            <p>Time: {new Date(workshop.date).toLocaleTimeString()}</p>
            <button
              className={`mt-2 px-4 py-2 rounded-lg text-white ${
                joined[workshop.id]
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              onClick={() => handleJoin(workshop.id, workshop.title)}
              disabled={!!joined[workshop.id]}
            >
              {joined[workshop.id] ? "Joined" : "Join Workshop"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
