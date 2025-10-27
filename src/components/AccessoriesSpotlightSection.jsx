"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- SafeImage: next/image with safe fallback ---------- */
function SafeImage({
  src,
  alt = "",
  className = "",
  fill,
  sizes,
  priority,
  allowedHosts,
  placeholderSrc = "/placeholder-pet.jpg", // default fallback
  showFallback = true,                      // render placeholder if src invalid
}) {
  const str = typeof src === "string" ? src.trim() : "";
  const hasSrc = str.length > 0;

  if (!hasSrc) {
    // No src → placeholder or nothing
    return showFallback ? (
      <Image
        src={placeholderSrc}
        alt={alt || "placeholder image"}
        className={className}
        {...(fill ? { fill } : { width: 400, height: 300 })}
        sizes={sizes}
        priority={priority}
      />
    ) : null;
  }

  // Remote host whitelist check
  const isRemote = /^https?:\/\//i.test(str);
  let host = null;
  try {
    if (isRemote) host = new URL(str).hostname;
  } catch {}

  const defaultAllowed = ["i.ibb.co", "localhost"];
  const whitelist = new Set([...(allowedHosts || []), ...defaultAllowed].filter(Boolean));
  const isAllowed = !isRemote || (host && whitelist.has(host));

  if (isAllowed) {
    return (
      <Image
        src={str}
        alt={alt || "image"}
        className={className}
        {...(fill ? { fill } : { width: 400, height: 300 })}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  // Fallback <img>
  return (
    <img
      src={str}
      alt={alt || "image"}
      className={`absolute inset-0 ${className}`.trim()}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

/* ---------- Demo data ---------- */
const DEMO_ACCESSORIES = [
  {
    id: "a1",
    name: "Comfort Harness",
    category: "Walking",
    brand: "PawCo",
    price: 24.99,
    oldPrice: 32.0,
    rating: 4.6,
    reviews: 128,
    image: "https://i.ibb.co/cXpz7TKN/harness.jpg",
    badge: "Sale",
    inStock: true,
  },
  {
    id: "a2",
    name: "Ceramic Bowl",
    category: "Feeding",
    brand: "PetNest",
    price: 18.5,
    rating: 4.3,
    reviews: 76,
    image: "https://i.ibb.co/S79wdT8R/bowls.jpg", 
    badge: "New",
    inStock: true,
  },
  {
    id: "a3",
    name: "Chew Toy Set",
    category: "Toys",
    brand: "ChewyTime",
    price: 14.0,
    rating: 4.1,
    reviews: 64,
    image: "https://i.ibb.co/k7VDcg5/chewy-toy.jpg", 
  },
  {
    id: "a4",
    name: "Cozy Bed (M/L)",
    category: "Beds",
    brand: "Snuggo",
    price: 39.99,
    rating: 4.8,
    reviews: 210,
    image: "https://i.ibb.co/JDQHxV6/bed.jpg", 
    badge: "Top",
    inStock: true,
  },
];

/* ---------- Section ---------- */
export default function AccessoriesSpotlightSection() {
  const [hover, setHover] = useState(null);
  const picks = useMemo(() => DEMO_ACCESSORIES.slice(0, 4), []);

  return (
    <section className="relative py-14">
      {/* background paw pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/paws-bg.png')] bg-[length:240px_240px] opacity-5" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold uppercase tracking-wide">
              🛍️ Pet Accessories
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#4C3D3D]">
              Make Their Life Comfier
            </h2>
            <p className="mt-1 text-gray-600 max-w-2xl">
              Hand-picked essentials for walking, feeding, playtime and sleep.
            </p>
          </div>
          <Link href="/accessories" className="btn btn-ghost normal-case">
            View all →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((p) => (
            <motion.article
              key={p.id}
              className="group card bg-base-100 shadow hover:shadow-lg border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="relative h-48">
                <SafeImage
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {p.badge && (
                  <span className="absolute left-2 top-2 badge badge-primary text-white">
                    {p.badge}
                  </span>
                )}
                <AnimatePresence>
                  {hover === p.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/10"
                    />
                  )}
                </AnimatePresence>
              </div>
              <div className="card-body p-4">
                <h3 className="font-semibold leading-snug line-clamp-2">{p.name}</h3>
                <p className="text-xs text-gray-500">
                  {p.brand} • {p.category}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Price price={p.price} old={p.oldPrice} />
                  <Rating rating={p.rating} reviews={p.reviews} />
                </div>
                <div className="card-actions mt-3">
                  <Link href={`/accessories#${p.id}`} className="btn btn-sm btn-outline">
                    Quick view
                  </Link>
                  <button className="btn btn-sm btn-primary">Add to cart</button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Price ---------- */
function Price({ price, old }) {
  const priceNum = Number(price) || 0;
  const oldNum = old != null ? Number(old) : null;
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-bold">${priceNum.toFixed(2)}</span>
      {oldNum != null ? (
        <span className="text-xs line-through opacity-60">${oldNum.toFixed(2)}</span>
      ) : null}
    </div>
  );
}

/* ---------- Rating ---------- */
function Rating({ rating, reviews }) {
  const rounded = Math.round((Number(rating) || 0) * 2) / 2;
  return (
    <div className="flex items-center gap-1 text-xs">
      <span>⭐ {rounded.toFixed(1)}</span>
      {reviews ? <span className="opacity-60">({reviews})</span> : null}
    </div>
  );
}
