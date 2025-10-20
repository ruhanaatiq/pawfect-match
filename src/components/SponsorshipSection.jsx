"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SponsorshipSection() {
  const sponsors = [
    // Bronze Sponsors
    {
      name: "TechNova Solutions",
      logo: "https://logo.com/brand/technova-solutions-eqtoo4/logos",
      url: "https://technovasolutions.io",
      tier: "Bronze",
    },
    {
      name: "Green Future Foundation",
      logo: "https://greenfuturefoundation.com/assets/images/logo.png",
      url: "https://greenfuturefoundation.com",
      tier: "Bronze",
    },

    // Silver Sponsors
    {
      name: "EduBridge Network",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Logo_Edu_Bridge.png", // placeholder
      url: "https://www.edubridge.org/",
      tier: "Silver",
    },
    {
      name: "Sparksoft Corporation",
      logo: "https://www.sparksoftcorp.com/sites/all/themes/sparksofttheme/logo.png",
      url: "https://www.sparksoftcorp.com",
      tier: "Silver",
    },

    // Gold Sponsors
    {
      name: "BrightPath Media",
      logo: "https://www.brightpath-media.com/wp-content/uploads/2023/02/brightpath-media-logo.png",
      url: "https://www.brightpath-media.com",
      tier: "Gold",
    },
  ];

  const tiers = ["Bronze", "Silver", "Gold"];

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-100 py-20 px-6 md:px-12 rounded-3xl shadow-xl overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-800 mb-4">
          Become a Sponsor
        </h2>
        <p className="text-lg text-gray-700 mb-12">
          Organizations and partners can create lasting impact by supporting us
          with sponsorship.
        </p>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier) => (
            <motion.div
              key={tier}
              whileHover={{ y: -8 }}
              className={`p-8 rounded-2xl shadow-lg border ${
                tier === "Bronze"
                  ? "bg-emerald-100 border-emerald-200"
                  : tier === "Silver"
                  ? "bg-emerald-200 border-emerald-300"
                  : "bg-emerald-300 border-emerald-400"
              }`}
            >
              <h3 className="text-2xl font-semibold text-emerald-800 mb-2">
                {tier}
              </h3>
              <p className="text-gray-700">
                {tier === "Bronze"
                  ? "Logo on website"
                  : tier === "Silver"
                  ? "Logo + social media mentions"
                  : "Event branding + all perks"}
              </p>

              {/* Sponsors under this tier */}
              <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                {sponsors
                  .filter((sponsor) => sponsor.tier === tier)
                  .map((sponsor, index) => (
                    <a
                      key={index}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-1"
                    >
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="h-14 grayscale hover:grayscale-0 transition duration-300"
                      />
                      <p className="text-sm text-gray-600 font-medium">
                        {sponsor.name}
                      </p>
                    </a>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-10 py-4 bg-yellow-400 text-gray-900 font-bold rounded-full shadow-md hover:bg-yellow-300 transition-all"
        >
          <Link href="/apply-sponsor" className="w-full h-full block">
            Apply as Sponsor
          </Link>
        </motion.button>
      </div>
    </section>
  );
}
