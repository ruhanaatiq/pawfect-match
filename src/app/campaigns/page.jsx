"use client";

import { useState, useEffect } from "react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    async function fetchCampaigns() {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data);
    }
    fetchCampaigns();
  }, []);

  const filtered = campaigns
    .filter(c =>
      filterStatus === "All" ? true : c.status === filterStatus
    )
    .sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "Goal") return b.targetAmount - a.targetAmount;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-4 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="Newest">Newest</option>
          <option value="Goal">Goal Amount</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(c => (
          <div key={c._id} className="p-4 border rounded-lg shadow hover:shadow-lg">
            <h2 className="text-xl font-semibold">{c.title}</h2>
            <p className="text-gray-600">{c.description.slice(0, 100)}...</p>
            <p className="mt-2 text-sm text-gray-500">
              Status: {c.status} | Raised: ${c.raisedAmount} / ${c.targetAmount}
            </p>
            <a href={`/campaigns/${c._id}`} className="text-emerald-600 mt-2 block hover:underline">
              View Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
