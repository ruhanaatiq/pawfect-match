"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------------------
   Fancy Buttons
---------------------------- */
function ViewDetailsButton({ href }) {
  return (
    <motion.a
      href={href}
      className=" btn btn-outline btn-accent text-emerald-700 px-5 gap-2 overflow-hidden group"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10">View details</span>
      <motion.span
        className="relative z-10"
        initial={{ x: 0 }}
        whileHover={{ x: 3 }}
      >
        →
      </motion.span>
      <span className="pointer-events-none absolute inset-0  ring-2 ring-primary/20 group-hover:ring-primary/40 transition" />
      <motion.span
        className="pointer-events-none absolute -inset-y-2 -left-10 w-10 rotate-[20deg] bg-white/30"
        initial={{ x: -80, opacity: 0 }}
        whileHover={{ x: 220, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.a>
  );
}

function BackToQuizButton() {
  return (
    <motion.a
      href="/matchmaker"
      className="btn btn-outline px-2 gap-2 overflow-hidden group bg-emerald-500 text-white hover:bg-emerald-600"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      ← Back to quiz
      <motion.span
        initial={{ x: 0 }}
        whileHover={{ x: -3 }}
        className="ml-1"
      />
    </motion.a>
  );
}

/* ---------------------------
   Skeleton Loader
---------------------------- */
function SkeletonCard() {
  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <div className="h-56 w-full bg-base-200 animate-pulse" />
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-base-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-base-200 rounded animate-pulse" />
        </div>
        <div className="mt-2 space-y-2">
          <div className="h-4 w-3/4 bg-base-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-base-200 rounded animate-pulse" />
        </div>
        <div className="card-actions justify-end mt-4">
          <div className="h-10 w-28 bg-base-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Pet Card
---------------------------- */
function PetCard({ p, index }) {
  const img =
    (Array.isArray(p.images) && p.images.length ? p.images[0] : p.image) ||
    "/placeholder-pet.jpg";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, delay: 0.03 * index, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <div className="card bg-base-100 shadow-xl ring-1 ring-base-200/60 hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
        <figure className="relative">
          <img
            src={img}
            alt={p.name}
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-100/40 via-transparent to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * index + 0.25 }}
            className="absolute top-3 right-3 tooltip tooltip-left"
            data-tip={`${p.matchScore}% compatibility based on your quiz`}
          >
            <span className="badge badge-primary text-white shadow-md">
              {Math.round(p.matchScore ?? 0)}% match
            </span>
          </motion.div>
        </figure>

        <div className="card-body">
          <div className="flex items-center justify-between gap-2">
            <h2 className="card-title leading-tight">{p.name}</h2>
          </div>

          <p className="text-sm opacity-80 capitalize">
            {p.breed || "Mixed"} • {p.size || "—"} • {p.age ?? "—"}y
          </p>

          {Array.isArray(p.matchReasons) && p.matchReasons.length > 0 ? (
            <ul className="mt-2 text-sm list-disc list-inside space-y-1">
              {p.matchReasons.slice(0, 3).map((r, i) => (
                <li key={i} className="opacity-90">{r}</li>
              ))}
              {p.matchReasons.length > 3 && (
                <li className="opacity-70">…and more</li>
              )}
            </ul>
          ) : null}

          <div className="card-actions justify-end mt-4">
            <ViewDetailsButton href={`/pets/${p._id}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------
   Results Page
---------------------------- */
export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)),
    [rows]
  );

  useEffect(() => {
    const run = async () => {
      try {
        const prefs = JSON.parse(localStorage.getItem("pm_prefs") || "{}");
        const r = await fetch("/api/match", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(prefs),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || "Failed to fetch matches");
        setRows(j.results || []);
      } catch (e) {
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4 flex items-center justify-between gap-3"
      >
        <h1 className="text-3xl font-bold">Your Matches</h1>
        <div className="flex items-center gap-2">
          <BackToQuizButton />
          {sorted.length > 0 && (
            <span className="badge badge-outline">
              {sorted.length} found
            </span>
          )}
        </div>
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </motion.div>
      )}

      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-error"
        >
          <span>{error}</span>
        </motion.div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert"
        >
          <div>
            <h3 className="font-bold">No pets found</h3>
            <div className="text-sm opacity-80">
              Try adjusting your preferences or widening your search.
            </div>
          </div>
          <BackToQuizButton />
        </motion.div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <motion.div
          layout
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {sorted.map((p, i) => (
              <PetCard key={p._id} p={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
