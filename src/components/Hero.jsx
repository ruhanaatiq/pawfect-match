"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    // redirect to adopt page with search term
    router.push(`/adopt?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Paw background pattern */}
      <div className="absolute inset-0 bg-[url('/paws-bg.png')] bg-repeat opacity-10"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#4C3D3D]">
            Find Your <span className="text-emerald-600">Best Match</span>
          </h1>
          <p className="mt-4 text-gray-700 max-w-md">
            Discover loving pets from shelters and foster homes. Adopt a furry
            friend and give them the home they deserve.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-6 flex items-center bg-white shadow-md rounded-full overflow-hidden max-w-md mx-auto md:mx-0"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pets..."
              className="flex-1 px-4 py-3 outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Right Image */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px]">
            {/* Blue Shape Behind */}
            <div className="absolute inset-0 bg-emerald-500 rounded-[50%_40%_60%_50%] rotate-6"></div>

            {/* Pet Image */}
            <Image
              src="/different-pets-selection.png"
              alt="Dog and Cat"
              fill
              className="object-contain relative z-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
