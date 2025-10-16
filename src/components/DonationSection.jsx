"use client";

import React from "react";

export default function DonationSection() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
        Make a Donation
      </h2>
      <p className="text-gray-600 mb-6">
        Every contribution helps feed, shelter, and provide medical care for pets in need.
      </p>

      {/* Quick Donation Amount Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition">
          $10 - Food for 1 week
        </button>
        <button className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition">
          $25 - Vet checkup
        </button>
        <button className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition">
          $50 - Shelter support
        </button>
        <button className="px-6 py-3 bg-yellow-200 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition">
          Custom Amount
        </button>
      </div>

      {/* One-time / Monthly Toggle */}
      <div className="flex items-center gap-6 mb-6">
        <label className="flex items-center gap-2">
          <input type="radio" name="donationType" className="accent-emerald-400" defaultChecked />
          One-time
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="donationType" className="accent-emerald-400" />
          Monthly
        </label>
      </div>

      {/* Pet story + Impact Stats */}
      <div className="mt-8">
        {/* You can add your pet story cards or impact stats here */}
        <p className="text-gray-700 italic">Pet story & impact stats go here...</p>
      </div>
    </div>
  );
}
