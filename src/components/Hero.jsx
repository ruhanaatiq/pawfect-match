"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const PET_SLIDES = [
  { src: "/different-pets-selection.png", alt: "Happy dog and cat" },
  { src: "/adopt-pet-concept.png", alt: "Cute kitten" },
  { src: "/animals.png", alt: "Playful puppy" },
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const slides = useMemo(() => PET_SLIDES.filter(Boolean), []);

  // autoplay carousel
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, 3500);
    return () => clearInterval(id);
  }, [slides.length]);

  // ✅ JS version (no TS types)
  const goTo = useCallback((idx) => {
    setCurrent((idx + slides.length) % slides.length);
  }, [slides.length]);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/adopt?q=${encodeURIComponent(q)}`);
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* animated paw background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/paws-bg.png')] bg-[length:220px_220px] opacity-10 animate-pawFloat" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <motion.div
          className="text-center md:text-left"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#4C3D3D]">
            Find Your{" "}
            <motion.span
              className="text-emerald-600 inline-block"
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.03, 1] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Best Match
            </motion.span>
          </h1>

          <motion.p
            className="mt-4 text-gray-700 max-w-md md:max-w-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Discover loving pets from shelters and foster homes. Adopt a furry
            friend and give them the home they deserve.
          </motion.p>

          {/* Search Box */}
          <motion.form
            onSubmit={handleSearch}
            className="mt-6 flex items-center bg-white shadow-md rounded-full overflow-hidden max-w-md mx-auto md:mx-0 focus-within:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            role="search"
            aria-label="Pet search"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pets (e.g., Husky, kitten, Dhaka)..."
              className="flex-1 px-5 py-3 outline-none"
              aria-label="Search pets"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Search
            </button>
          </motion.form>

          {/* Quick actions */}
          <motion.div
            className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {["Dogs", "Cats", "Rabbits"].map((c) => (
              <button
                key={c}
                onClick={() => router.push(`/categories/${c.toLowerCase()}`)}
                className="px-3 py-1.5 rounded-full text-sm bg-white/80 hover:bg-white border border-gray-200 shadow-sm"
              >
                {c}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Animated blob + Carousel */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[320px] h-[320px] md:w-[440px] md:h-[440px]">
            {/* Rotating organic blob */}
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-[50%_45%_55%_50%] bg-[#FFF7D4]"
              initial={{ rotate: 0, scale: 0.95 }}
              animate={{ rotate: 360, scale: [0.95, 1, 0.97, 1] }}
              transition={{
                rotate: { duration: 28, repeat: Infinity, ease: "linear" },
                scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
            />

            {/* Carousel viewport */}
            <div className="absolute inset-4 md:inset-6 rounded-3xl overflow-hidden shadow-xl bg-white/40 backdrop-blur-[1px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={slides[current]?.src ?? current}
                  className="relative w-full h-full"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  {slides[current] && (
                    <Image
                      src={slides[current].src}
                      alt={slides[current].alt}
                      fill
                      priority
                      className="object-contain"
                      sizes="(max-width: 768px) 320px, 440px"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dot indicators */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {slides.map((_, i) => {
                const active = i === current;
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      active ? "w-6 bg-emerald-600" : "w-2.5 bg-emerald-300 hover:bg-emerald-400"
                    }`}
                  />
                );
              })}
            </div>

            {/* Prev/Next */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              <button
                className="pointer-events-auto grid place-items-center w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow"
                aria-label="Previous slide"
                onClick={() => goTo(current - 1)}
              >
                ←
              </button>
              <button
                className="pointer-events-auto grid place-items-center w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow"
                aria-label="Next slide"
                onClick={() => goTo(current + 1)}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* local styles for background float */}
      <style jsx>{`
        @keyframes pawFloat {
          0% { background-position: 0 0; }
          50% { background-position: 30px 20px; }
          100% { background-position: 0 0; }
        }
        .animate-pawFloat {
          animation: pawFloat 18s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
