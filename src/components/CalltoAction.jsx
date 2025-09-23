"use client";
import Link from "next/link";
import { FaPaw } from "react-icons/fa";

export default function CalltoAction() {
  return (
    <section
      className="relative py-16 md:py-20 text-[#4C3D3D]"
      style={{ backgroundColor: "rgba(249, 242, 229,0.5)" }}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Decorative Bubble */}
        <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 shadow-sm mb-6">
          <FaPaw className="text-emerald-600" />
          <span className="text-2xl md:text-3xl font-semibold">
            Ready to Adopt?
          </span>
        </p>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          Find Your <span className="text-emerald-600">Pawfect Match</span> Today
        </h2>
        <p className="text-lg text-[#4C3D3D]/80 mb-8 max-w-2xl mx-auto">
          Browse verified shelters, explore pets by category, and take the first
          step toward welcoming a new best friend into your life.
        </p>

        {/* CTA Button */}
        <Link
          href="/adopt"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 shadow transition"
        >
          Start Adopting
          <FaPaw aria-hidden className="text-base" />
        </Link>
      </div>
    </section>
  );
}
