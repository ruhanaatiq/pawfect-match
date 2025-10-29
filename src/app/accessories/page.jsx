// src/app/accessories/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

/* ---------------------------------------------
   SafeImage — avoids next/image host errors
---------------------------------------------- */
function SafeImage({
  src,
  alt = "",
  className = "",
  fill = false,
  sizes,
  priority = false,
  allowedHosts = ["i.ibb.co", "localhost"],
}) {
  const url = typeof src === "string" ? src.trim() : "";
  if (!url) return null;

  const isRemote = /^https?:\/\//i.test(url);
  let host = "";
  try { if (isRemote) host = new URL(url).hostname; } catch {}

  const canUseNextImage = !isRemote || allowedHosts.includes(host);

  if (canUseNextImage) {
    return fill ? (
      <Image src={url} alt={alt} fill className={className} sizes={sizes} priority={priority} />
    ) : (
      <Image src={url} alt={alt} width={400} height={300} className={className} sizes={sizes} priority={priority} />
    );
  }
  return <img src={url} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
}

/* ---------------------------------------------
   Demo data (fixed URLs & typos)
---------------------------------------------- */
const DEMO_ACCESSORIES_LIST = [
  { id: "a1", name: "Comfort Harness", category: "Walking", brand: "PawCo", price: 24.99, oldPrice: 32, rating: 4.6, reviews: 128, image: "https://i.ibb.co/cXpz7TKN/harness.jpg", badge: "Sale", inStock: true },
  { id: "a2", name: "Ceramic Bowl", category: "Feeding", brand: "PetNest", price: 18.5, rating: 4.3, reviews: 76, image: "https://i.ibb.co/S79wdT8R/bowls.jpg", badge: "New", inStock: true },
  { id: "a3", name: "Chew Toy Set", category: "Toys", brand: "ChewyTime", price: 14.0, rating: 4.1, reviews: 64, image: "https://i.ibb.co/b85HqVx/chewy-toy.jpg", inStock: true },
  { id: "a4", name: "Cozy Bed (M/L)", category: "Beds", brand: "Snuggo", price: 39.99, rating: 4.8, reviews: 210, image: "https://i.ibb.co/HLpb42Tp/bed.jpg", badge: "Top", inStock: true },
  { id: "a5", name: "LED Collar", category: "Walking", brand: "GlowPaws", price: 12.99, rating: 4.2, reviews: 41, image: "https://i.ibb.co/chhFvB7G/led-collar.jpg", inStock: false },
  { id: "a6", name: "Travel Carrier", category: "Travel", brand: "RoamPet", price: 55.0, rating: 4.7, reviews: 96, image: "https://i.ibb.co/dJgYnM45/carrier.jpg", badge: "Hot", inStock: true },
  { id: "a7", name: "Grooming Kit", category: "Grooming", brand: "FurCare", price: 22.0, rating: 4.4, reviews: 72, image: "https://i.ibb.co/CKHSWkzq/grooimg-kit.jpg", inStock: true },
  { id: "a8", name: "Cooling Mat", category: "Beds", brand: "ChillPet", price: 27.5, rating: 4.0, reviews: 35, image: "https://i.ibb.co/spf1w9Pd/cooling-amt.jpg", inStock: true },
  { id: "a9", name: "Puzzle Feeder", category: "Feeding", brand: "BrainyBowl", price: 21.0, rating: 4.5, reviews: 119, image: "https://i.ibb.co/xKRJSVf8/puzzle-feeder.jpg", inStock: true },
];

/* ---------------------------------------------
   Small helpers
---------------------------------------------- */
const unique = (arr) => Array.from(new Set(arr)).filter(Boolean);

function Price({ price, old }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-bold">${Number(price).toFixed(2)}</span>
      {old ? <span className="text-xs line-through opacity-60">${Number(old).toFixed(2)}</span> : null}
    </div>
  );
}

function Rating({ rating, reviews }) {
  const rounded = Math.round(Number(rating) * 2) / 2;
  return (
    <div className="flex items-center gap-1 text-xs">
      <span>⭐ {rounded.toFixed(1)}</span>
      {reviews ? <span className="opacity-60">({reviews})</span> : null}
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-[#4C3D3D]">{title}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-sm border transition " +
        (active
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700")
      }
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------
   Page
---------------------------------------------- */
export default function AccessoriesPage() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [cat, setCat] = useState(null);
  const [brand, setBrand] = useState(null);
  const [price, setPrice] = useState([0, 80]);
  const [rating, setRating] = useState(0);
  const [onlyStock, setOnlyStock] = useState(false);

  const cats = useMemo(() => unique(DEMO_ACCESSORIES_LIST.map((x) => x.category)), []);
  const brands = useMemo(() => unique(DEMO_ACCESSORIES_LIST.map((x) => x.brand)), []);

  const filtered = useMemo(() => {
    let rows = DEMO_ACCESSORIES_LIST.slice();

    if (q) {
      const t = q.toLowerCase();
      rows = rows.filter((r) =>
        [r.name, r.brand, r.category].some((x) => String(x).toLowerCase().includes(t))
      );
    }
    if (cat) rows = rows.filter((r) => r.category === cat);
    if (brand) rows = rows.filter((r) => r.brand === brand);

    rows = rows.filter((r) => r.price >= price[0] && r.price <= price[1]);
    if (rating > 0) rows = rows.filter((r) => r.rating >= rating);
    if (onlyStock) rows = rows.filter((r) => r.inStock);

    switch (sort) {
      case "price-asc": rows.sort((a, b) => a.price - b.price); break;
      case "price-desc": rows.sort((a, b) => b.price - a.price); break;
      case "rating": rows.sort((a, b) => b.rating - a.rating); break;
      default: rows.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
    return rows;
  }, [q, cat, brand, price, rating, onlyStock, sort]);

  // Deep-link quick-buy by hash (#id)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.location.hash?.slice(1);
    if (!id) return;
    const p = DEMO_ACCESSORIES_LIST.find((x) => x.id === id);
    if (p) goToPayment(p);
  }, []);

  function goToPayment(product, qty = 1) {
    try {
      const current = JSON.parse(localStorage.getItem("cart") || "[]");
      const idx = current.findIndex((i) => i.id === product.id);
      if (idx >= 0) current[idx].qty += qty;
      else current.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
      localStorage.setItem("cart", JSON.stringify(current));
    } catch {}
    router.push("/payment");
  }

  return (
    <div className="relative isolate max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#4C3D3D]">Accessories</h1>
        <p className="text-gray-600">Everything you need for happy paws — bowls, beds, toys, and more.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="relative z-10 card bg-base-100 shadow border border-gray-100 h-fit p-0">
          <div className="card-body space-y-4">
            <div>
              <label className="input input-bordered flex items-center gap-2">
                <span>🔎</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  className="grow"
                  placeholder="Search accessories…"
                />
              </label>
            </div>

            <FilterGroup title="Category">
              <div className="flex flex-wrap gap-2">
                <Chip active={!cat} onClick={() => setCat(null)}>All</Chip>
                {cats.map((c) => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Brand">
              <div className="flex flex-wrap gap-2">
                <Chip active={!brand} onClick={() => setBrand(null)}>All</Chip>
                {brands.map((b) => (
                  <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</Chip>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Price">
              <div className="px-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={price[1]}
                  onChange={(e) => setPrice([0, Number(e.target.value)])}
                  className="range range-primary"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$0</span><span>${price[1]}</span>
                </div>
              </div>
            </FilterGroup>

            <FilterGroup title="Rating">
              <div className="flex flex-wrap gap-2">
                {[0, 3, 4, 4.5].map((r) => (
                  <Chip key={r} active={rating === r} onClick={() => setRating(r)}>
                    {r === 0 ? "All" : `★ ${r}+`}
                  </Chip>
                ))}
              </div>
            </FilterGroup>

            <div className="flex items-center justify-between">
              <span className="text-sm">In Stock only</span>
              <input type="checkbox" className="toggle" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} />
            </div>

            <button
              onClick={() => { setQ(""); setCat(null); setBrand(null); setPrice([0, 80]); setRating(0); setOnlyStock(false); }}
              className="btn btn-sm btn-ghost"
            >
              Reset filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <section className="relative z-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{filtered.length} items</span>
            <select className="select select-bordered select-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <motion.article
                key={p.id}
                className="group card bg-base-100 shadow border border-gray-100 overflow-hidden relative"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Media */}
                <div className="relative h-48">
                  <SafeImage src={p.image} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
                  {!p.inStock && <span className="absolute left-2 top-2 z-10 badge">Out of stock</span>}
                  {p.badge && <span className="absolute right-2 top-2 z-10 badge badge-primary text-white">{p.badge}</span>}
                </div>

                {/* Body (flex so actions don’t get pushed out) */}
                <div className="card-body p-4 flex flex-col gap-2 min-h-[140px]">
                  <div>
                    <h3 className="font-semibold leading-snug line-clamp-2">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.brand} • {p.category}</p>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <Price price={p.price} old={p.oldPrice} />
                    <Rating rating={p.rating} reviews={p.reviews} />
                  </div>

                  {/* Actions pinned at bottom */}
                  <div className="mt-auto">
                    <button
                      className={`btn btn-sm rounded-none h-10 px-4 border-2 font-semibold flex items-center gap-2
                        ${p.inStock
                          ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          : "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed opacity-80"}`}
                      disabled={!p.inStock}
                      onClick={() => p.inStock && goToPayment(p, 1)}
                    >
                      {/* cart icon on the left */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                           viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
                        <path d="M16 3v4m2-2h-4" />
                      </svg>
                      Add To Cart
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
