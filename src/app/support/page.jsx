"use client";

import React from "react";
import Link from "next/link";
import DonationSection from "@/components/DonationSection";
import SponsorshipSection from "@/components/SponsorshipSection";
import { FaHeart, FaPaw } from "react-icons/fa";
import { GiCat, GiDogHouse, GiSittingDog } from "react-icons/gi";

export default function SupportPage() {
  return (
    <div className="bg-gray-50">
      {/* -------------------- HERO SECTION -------------------- */}

      <section className="relative bg-emerald-300 text-white overflow-hidden py-28 rounded-br-3xl rounded-tl-3xl">
        {/* Background Gradient Circles */}
        <div className="absolute top-0 left-10 w-64 h-64 bg-yellow-400/40 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-yellow-300/30 rounded-full animate-pulse-slow delay-500"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600/30 rounded-full animate-pulse-slow"></div>

        {/* Pet Illustrations */}
        <GiDogHouse className="absolute bottom-10 left-1/4 w-32 h-32 text-emerald-500/50 animate-bounce-slow" />
        <GiCat className="absolute top-10 right-1/4 w-24 h-24 text-yellow-400/60 animate-bounce-slow delay-300" />
        <GiSittingDog className="absolute bottom-20 right-20 w-28 h-28 text-white/50 animate-bounce-slow delay-500" />

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            🐾 Support Pawfect Match
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-xl mx-auto drop-shadow-sm">
            Help rescued pets find their forever homes. Every click makes a
            difference!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="#donations"
              className="px-10 py-4 bg-yellow-400 text-gray-900 font-extrabold rounded-full shadow-lg hover:bg-yellow-300 transition transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center"
            >
              <FaHeart className="inline mr-2 animate-bounce" /> Donate Now
            </Link>

            <Link
              href="#sponsorships"
              className="px-10 py-4 bg-emerald-700 text-white font-extrabold rounded-full shadow-lg hover:bg-emerald-600 transition transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center"
            >
              <FaPaw className="inline mr-2 animate-bounce" /> Become a Sponsor
            </Link>
          </div>

          {/* Floating paw prints */}
          <FaPaw className="absolute top-5 left-1/2 text-4xl text-yellow-300/50 animate-bounce-slow" />
          <FaPaw className="absolute bottom-5 right-1/3 text-5xl text-white/30 animate-bounce-slow delay-700" />
          <FaPaw className="absolute top-1/3 right-10 text-3xl text-yellow-200/40 animate-bounce-slow delay-500" />
        </div>

        {/* Curved Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            className="relative block w-full h-20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,100 350,0 500,100 L500,00 L0,0 Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>

      {/* -------------------- SPONSORSHIP SECTION -------------------- */}
      <section id="sponsorships" className="max-w-5xl mx-auto mt-16 px-6">
        <SponsorshipSection />
      </section>

      {/* -------------------- DONATION SECTION -------------------- */}
      <section id="donations" className="max-w-5xl mx-auto mt-16 px-6">
        <DonationSection />
      </section>
    </div>
  );
}
