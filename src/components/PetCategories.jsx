"use client";
import Link from "next/link";
import { FaPaw } from "react-icons/fa";
import categoriesData from "../data/category.json";

const categoryIcons = {
  dogs: "🐕",
  cats: "🐈",
  birds: "🐦",
  fish: "🐠",
  reptiles: "🦎",
};

export default function PetCategories() {
  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 shadow-sm"> 
          <FaPaw className="text-emerald-600" />
          <span className="text-3xl font-semibold">Pet Categories</span>
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover your perfect companion from our wide range of pet categories
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {Object.keys(categoriesData.categories).map((cat) => (
          <Link
            key={cat}
            href={`/categories/${cat}`}
            className="group relative rounded-2xl bg-white/80 backdrop-blur p-6 shadow-sm border border-black/5 transition hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Decorative shape */}
            <div
              className="absolute -top-6 -right-6 h-24 w-24 rounded-[45%_55%_55%_45%] opacity-70 rotate-12 transition group-hover:rotate-0"
              style={{ backgroundColor: "rgb(222, 250, 235)" }}
            />

            <div className="relative z-10">
              {/* Icon */}
              <div
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white text-lg"
                style={{ backgroundColor: "rgb(0, 122, 85)" }}
              >
                {categoryIcons[cat] || "🐾"}
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-800 capitalize">
                {cat}
              </h3>
              <p className="mt-2 text-[15px] text-gray-600">
                Explore our collection of {cat.toLowerCase()} pets
              </p>

              <div
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "rgb(255, 159, 28)" }}
              >
                Browse pets <span aria-hidden>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      
    </div>
  );
}
