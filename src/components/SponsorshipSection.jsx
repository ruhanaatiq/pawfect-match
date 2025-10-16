"use client";

import React from "react";

export default function SponsorshipSection() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      {/* Sponsorship Levels */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1 p-6 bg-emerald-100 rounded-lg shadow">
          <h3 className="font-bold text-lg">Bronze</h3>
          <p>Logo on website</p>
        </div>
        <div className="flex-1 p-6 bg-emerald-200 rounded-lg shadow">
          <h3 className="font-bold text-lg">Silver</h3>
          <p>Logo + social media mentions</p>
        </div>
        <div className="flex-1 p-6 bg-emerald-300 rounded-lg shadow">
          <h3 className="font-bold text-lg">Gold</h3>
          <p>Event branding + all perks</p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full hover:bg-yellow-300 transition">
          Apply as Sponsor
        </button>
      </div>

      {/* Logos of current sponsors */}
      <div className="mt-12 flex flex-wrap justify-center gap-6">
        <p className="text-gray-700 italic">Sponsor logos go here...</p>
      </div>
    </div>
  );
}
