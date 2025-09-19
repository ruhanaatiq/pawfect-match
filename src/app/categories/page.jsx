"use client";

import Link from "next/link";
import { FaPaw } from "react-icons/fa";
import categoriesData from "@/data/category.json" assert { type: "json" };

export default function CategoriesPage() {
  // Count total species across all categories
  const totalSpecies = Object.keys(categoriesData.categories).reduce(
    (total, category) =>
      total + Object.keys(categoriesData.categories[category].species).length,
    0
  );

  return (
    <section
      className="relative py-16 md:py-20 text-[#4C3D3D]"
      aria-labelledby="categories-heading"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 shadow-sm">
            <FaPaw className="text-emerald-600" />
            <span className="text-3xl font-semibold">Pet Categories</span>
          </p>
          <h2
            id="categories-heading"
            className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight"
          >
            Explore & Find Your <span className="text-emerald-600">Companion</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-[15px] text-[#4C3D3D]/80">
            Discover a variety of pet categories and browse through species and
            breeds that match your lifestyle.
          </p>

          {/* Stats */}
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm">
            <span className="font-semibold text-emerald-700">
              {Object.keys(categoriesData.categories).length}
            </span>
            <span className="text-gray-600 ml-1">categories •</span>
            <span className="font-semibold ml-1 text-emerald-700">
              {totalSpecies}
            </span>
            <span className="text-gray-600 ml-1">species</span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {Object.keys(categoriesData.categories).map((category) => {
            const speciesCount =
              Object.keys(categoriesData.categories[category].species).length;
            const breedsCount = Object.values(
              categoriesData.categories[category].species
            ).reduce((total, breeds) => total + breeds.length, 0);

            return (
              <Link
                key={category}
                href={`/categories/${category}`}
                className="group relative rounded-2xl bg-white/80 backdrop-blur p-6 shadow-sm border border-black/5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Decorative bubble */}
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-[45%_55%_55%_45%] bg-emerald-100 opacity-70 rotate-12 transition group-hover:rotate-0" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold capitalize text-gray-800">
                      {category}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-600/10 text-emerald-700">
                      {speciesCount} species
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] text-[#4C3D3D]/80">
                    Explore {speciesCount} species and {breedsCount} breeds of{" "}
                    {category.toLowerCase()}.
                  </p>
                  <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 focus:outline-none">
                    Browse Breeds <span aria-hidden>→</span>
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
