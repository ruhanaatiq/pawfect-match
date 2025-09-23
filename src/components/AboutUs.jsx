"use client";

import Image from "next/image";

/** tiny inline paw icon so you don't need react-icons */
function PawBullet({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 ${className}`}
      fill="currentColor"
    >
      <path d="M7.5 8.25a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm9 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM10 9.5a2.2 2.2 0 1 0-4.4 0A2.2 2.2 0 0 0 10 9.5Zm8.8 0a2.2 2.2 0 1 0-4.4 0 2.2 2.2 0 0 0 4.4 0ZM12 11.25c-3.2 0-5.75 2.2-5.75 4.75 0 1.5 1.25 2.25 2.75 2.25h6c1.5 0 2.75-.75 2.75-2.25 0-2.55-2.55-4.75-5.75-4.75Z" />
    </svg>
  );
}

export default function About() {
  const features = [
    "Over 10 years of experience",
    "Exercise & mental stimulation",
    "Talented vets ready to help you",
    "Dental hygiene care",
    "High-quality products only",
    "Regular veterinary check-ups",
  ];

  return (
    <section id="about" className="relative py-16 md:py-20">
      {/* card wrapper to emulate the screenshot panel */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative grid items-center gap-10 rounded-3xl bg-white/80 backdrop-blur p-6 md:p-10 shadow-sm border border-black/5 md:grid-cols-2">
          {/* Left: photo with rounded blob background */}
          <div className="relative">
            {/* soft rounded background shape */}
            <div className="absolute inset-0 -left-6 -right-6 -top-6 -bottom-6 md:-left-10 md:-right-2 rounded-[28px] bg-[#4C3D3D]/10" />
            {/* decorative spark lines */}
            <div className="absolute -left-6 top-6 md:-left-10 md:top-4 text-[#4C3D3D]/40">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M8 24 L24 8 M10 36 L28 30 M18 46 L30 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="relative z-10 aspect-[5/6] w-full max-w-[420px] mx-auto overflow-hidden rounded-[28px]">
              {/* place your image at /public/about-pet.png */}
              <Image
                src="/owner-pets.jpg"
                alt="Happy pet with owner"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: content */}
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 shadow-sm text-sm font-semibold">
              <span className="text-emerald-600 text-3xl">About Us</span>
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
              Our Journey To <span className="text-emerald-600">PawfectMatch</span>
              <br />A Passion For Pets
            </h2>

            <p className="mt-3 text-[#4C3D3D]/80 leading-relaxed">
              We connect loving pets from shelters and foster homes with families.
              From discovery to adoption to lifelong care—we make every step simple,
              safe, and full of joy.
            </p>

            {/* feature bullets (2 columns) */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px] text-[#4C3D3D]">
                  <PawBullet className="mt-1 text-emerald-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="/about"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#4C3D3D] px-6 py-3 text-white font-semibold shadow hover:opacity-95"
            >
              More About Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}