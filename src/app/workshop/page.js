"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const workshopsData = [
  { id: 1, title: "Basic Pet Training", date: new Date("2025-10-20T15:00:00") },
  { id: 2, title: "Healthy Pet Nutrition", date: new Date("2025-10-25T14:00:00") },
  { id: 3, title: "Pet First Aid & Emergency Care", date: new Date("2025-10-28T16:00:00") },
  { id: 4, title: "Grooming & Hygiene", date: new Date("2025-11-02T13:30:00") },
];

export default function WorkshopPage() {
  const [now, setNow] = useState(new Date());
  const [joinedWorkshops, setJoinedWorkshops] = useState({}); // track joined workshops

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleJoin = (id, title) => {
    toast.success(`You joined "${title}"!`, { position: "top-right", autoClose: 3000 });
    setJoinedWorkshops((prev) => ({ ...prev, [id]: true }));
  };

  const getCountdown = (date) => {
    const diff = date - now;
    if (diff <= 0) return "Live now!";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen  p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-[#5b3924] mb-6">🐾 Upcoming Pet Workshops</h1>
      <div className="grid gap-6 w-full max-w-3xl">
        {workshopsData.map((workshop) => (
          <div key={workshop.id} className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#5b3924]">{workshop.title}</h2>
            <p className="text-gray-600 mb-2">
              Date: {workshop.date.toLocaleDateString()} | Time: {workshop.date.toLocaleTimeString()}
            </p>
            <p className="text-lg font-medium mb-4 text-[#704a2e]">{getCountdown(workshop.date)}</p>
            <button
              onClick={() => handleJoin(workshop.id, workshop.title)}
              disabled={joinedWorkshops[workshop.id]}
              className={`px-6 py-2 rounded-lg transition-all text-white ${
                joinedWorkshops[workshop.id]
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {joinedWorkshops[workshop.id] ? "Joined" : "Join Workshop"}
            </button>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
}
