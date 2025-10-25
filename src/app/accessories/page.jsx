"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

/* -------------------------------------------------
   Demo data (swap with your API later)
-------------------------------------------------- */
const DEMO_ACCESSORIES_LIST = [
  { id: "a1", name: "Comfort Harness", category: "Walking", brand: "PawCo", price: 24.99, oldPrice: 32, rating: 4.6, reviews: 128, image: "https://i.ibb.co/cXpz7TKN/harness.jpg", badge: "Sale", inStock: true },
  { id: "a2", name: "Ceramic Bowl", category: "Feeding", brand: "PetNest", price: 18.5, rating: 4.3, reviews: 76, image: "https://i.ibb.co/S79wdT8R/bowls.jpg", badge: "New", inStock: true },
  { id: "a3", name: "Chew Toy Set", category: "Toys", brand: "ChewyTime", price: 14.0, rating: 4.1, reviews: 64, image: "https://i.ibb.co/cXpz7TKN/harness.jpg", inStock: true },
  { id: "a4", name: "Cozy Bed (M/L)", category: "Beds", brand: "Snuggo", price: 39.99, rating: 4.8, reviews: 210, image: "https://i.ibb.co/cXpz7TKN/harness.jpg", badge: "Top", inStock: true },
  { id: "a5", name: "LED Collar", category: "Walking", brand: "GlowPaws", price: 12.99, rating: 4.2, reviews: 41, image: "/accessories/collar.jpg", inStock: false },
  { id: "a6", name: "Travel Carrier", category: "Travel", brand: "RoamPet", price: 55.0, rating: 4.7, reviews: 96, image: "/accessories/carrier.jpg", badge: "Hot", inStock: true },
  { id: "a7", name: "Grooming Kit", category: "Grooming", brand: "FurCare", price: 22.0, rating: 4.4, reviews: 72, image: "/accessories/groom.jpg", inStock: true },
  { id: "a8", name: "Cooling Mat", category: "Beds", brand: "ChillPet", price: 27.5, rating: 4.0, reviews: 35, image: "/accessories/coolmat.jpg", inStock: true },
  { id: "a9", name: "Puzzle Feeder", category: "Feeding", brand: "BrainyBowl", price: 21.0, rating: 4.5, reviews: 119, image: "/accessories/puzzle.jpg", inStock: true },
];

export const dynamic = "force-dynamic";

/* -------------------------------------------------
   Helpers (JS, not TS)
-------------------------------------------------- */
function unique(arr) {
  return Array.from(new Set(arr)).filter(Boolean);
}

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

/* -------------------------------------------------
   Page
-------------------------------------------------- */
export default function AccessoriesPage() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [cat, setCat] = useState(null);
  const [brand, setBrand] = useState(null);
  const [price, setPrice] = useState([0, 80]); // [min, max]
  const [rating, setRating] = useState(0);
  const [onlyStock, setOnlyStock] = useState(false);

  // Derived data
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
      case "price-asc":
        rows.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        rows.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        rows.sort((a, b) => b.rating - a.rating);
        break;
      default:
        rows.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }

    return rows;
  }, [q, cat, brand, price, rating, onlyStock, sort]);

  // optional: use hash to preselect an item
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.location.hash ? window.location.hash.slice(1) : "";
    if (!id) return;
    const p = DEMO_ACCESSORIES_LIST.find((x) => x.id === id);
    if (p) goToPayment(p);
  }, []);

  function goToPayment(product, qty = 1) {
    // Store a very small cart payload in localStorage
    // Structure: [{ id, name, price, image, qty }]
    try {
      const current = JSON.parse(localStorage.getItem("cart") || "[]");
      const idx = current.findIndex((i) => i.id === product.id);
      if (idx >= 0) current[idx].qty += qty;
      else current.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
      localStorage.setItem("cart", JSON.stringify(current));
    } catch {}

    // Navigate to payment page
    router.push("/payment");
  }

  return (
    <div className="relative isolate max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#4C3D3D]">Accessories</h1>
        <p className="text-gray-600">
          Everything you need for happy paws — bowls, beds, toys, and more.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6">
        {/* Sidebar Filters (scrolls away; not sticky) */}
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
                <Chip active={!cat} onClick={() => setCat(null)}>
                  All
                </Chip>
                {cats.map((c) => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Brand">
              <div className="flex flex-wrap gap-2">
                <Chip active={!brand} onClick={() => setBrand(null)}>
                  All
                </Chip>
                {brands.map((b) => (
                  <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
                    {b}
                  </Chip>
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
                  <span>$0</span>
                  <span>${price[1]}</span>
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
              <input
                type="checkbox"
                className="toggle"
                checked={onlyStock}
                onChange={(e) => setOnlyStock(e.target.checked)}
              />
            </div>

            <button
              onClick={() => {
                setQ("");
                setCat(null);
                setBrand(null);
                setPrice([0, 80]);
                setRating(0);
                setOnlyStock(false);
              }}
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
            <select
              className="select select-bordered select-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
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
                className="group card bg-base-100 shadow border border-gray-100 overflow-hidden relative z-0"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="relative h-48 z-0">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
                  {!p.inStock && <span className="absolute left-2 top-2 z-10 badge">Out of stock</span>}
                  {p.badge && (
                    <span className="absolute right-2 top-2 z-10 badge badge-primary text-white">
                      {p.badge}
                    </span>
                  )}
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
                  <div className="card-actions mt-3 justify-between">
                    {/* Quick view now behaves as "Buy now" → go to payment */}
                    <button
                      onClick={() => goToPayment(p, 1)}
                      className="btn btn-sm btn-outline"
                    >
                      Quick view
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={!p.inStock}
                      onClick={() => goToPayment(p, 1)}
                    >
                      Add to cart
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
