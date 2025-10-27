// src/app/donations/success/page.jsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FaHeart, FaHome, FaDownload } from "react-icons/fa";

/** Route options (avoid SSG; no accidental 'revalidate' function collisions) */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Loading…
        </div>
      }
    >
      <DonationSuccessContent />
    </Suspense>
  );
}

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [amountCents, setAmountCents] = useState(0);
  const [donationType, setDonationType] = useState("one-time");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");

  const [saved, setSaved] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const hasSavedRef = useRef(false);

  const amountUsd = useMemo(() => (amountCents / 100).toFixed(2), [amountCents]);

  /** 1) Load checkout session details from your API */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!sessionId) {
        router.replace("/");
        return;
      }

      try {
        const res = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );

        const ct = res.headers.get("content-type") || "";
        const json = ct.includes("application/json") ? await res.json() : null;

        if (!res.ok || !json) {
          throw new Error(`Failed to load session ${res.status}`);
        }

        if (cancelled) return;

        setAmountCents(Number(json.amount_total || 0));
        setDonationType(json.mode === "subscription" ? "monthly" : "one-time");
        setDonorEmail(json.customer_email || session?.user?.email || "");
        setDonorName(json.customer_name || session?.user?.name || "");
      } catch (err) {
        console.error("[donations/success] load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  /** 2) Persist the donation (only once) */
  useEffect(() => {
    async function save() {
      if (loading || hasSavedRef.current) return;
      if (!sessionId || !amountCents) return;

      hasSavedRef.current = true;

      try {
        const res = await fetch("/api/donations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            sessionId,
            amount: amountCents / 100,
            donationType,
            email: donorEmail || null,
            name: donorName || null,
          }),
        });

        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json")
          ? await res.json()
          : { error: await res.text() };

        if (res.ok && data?.success) setSaved(true);
        else console.error("Save donation failed:", data?.error || data);
      } catch (err) {
        console.error("[donations/success] save error:", err);
      }
    }

    save();
  }, [loading, sessionId, amountCents, donationType, donorEmail, donorName]);

  /** 3) Fire some confetti (lazy import keeps it client-only) */
  useEffect(() => {
    let id;
    (async () => {
      try {
        const { default: confetti } = await import("canvas-confetti");
        const end = Date.now() + 1000;
        id = setInterval(() => {
          if (Date.now() >= end) return clearInterval(id);
          confetti({
            particleCount: 10,
            spread: 50,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
          });
        }, 250);
      } catch (e) {
        // If the package isn't installed, skip gracefully
        console.warn("canvas-confetti not available:", e?.message || e);
      }
    })();

    return () => clearInterval(id);
  }, []);

  /** 4) Auto-redirect countdown */
  useEffect(() => {
    const id = setInterval(() => setCountdown((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (countdown === 0) router.push("/");
  }, [countdown, router]);

  /** 5) Download receipt (jsPDF via dynamic import) */
  const handleDownload = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const today = new Date().toLocaleString();

      doc.setFontSize(20);
      doc.text("Donation Receipt", 20, 20);

      doc.setFontSize(12);
      doc.text(`Amount: $${amountUsd}`, 20, 40);
      doc.text(
        `Type: ${donationType === "monthly" ? "Monthly" : "One-time"}`,
        20,
        50
      );
      doc.text(`Transaction ID: ${sessionId}`, 20, 60);
      doc.text(`Date: ${today}`, 20, 70);
      if (donorName) doc.text(`Donor: ${donorName}`, 20, 80);
      if (donorEmail) doc.text(`Email: ${donorEmail}`, 20, 90);

      doc.save(`donation-receipt-${sessionId}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    }
  };

  /** Animations */
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
          variants={itemVariants}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            variants={itemVariants}
          >
            Thank You!
          </motion.h1>

          <motion.p className="text-xl text-gray-600 mb-2" variants={itemVariants}>
            Your donation was successful!
          </motion.p>
          <motion.p className="text-gray-500 mb-8" variants={itemVariants}>
            You&apos;re making a real difference in the lives of rescued pets.
          </motion.p>

          {!loading && amountCents > 0 && (
            <motion.div
              className="bg-emerald-50 rounded-2xl p-6 mb-8"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="text-5xl font-bold text-emerald-600 mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
              >
                ${amountUsd}
              </motion.div>
              <p className="text-gray-600">
                {donationType === "monthly" ? "Monthly Donation" : "One-time Donation"}
              </p>
            </motion.div>
          )}

          <motion.div className="bg-pink-50 rounded-2xl p-6 mb-8" variants={itemVariants}>
            <FaHeart className="text-red-600 text-3xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Your Impact</h3>
            <p className="text-gray-700">
              Your generous donation will help provide food, shelter, and medical care for pets in
              need.
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-4 mb-6" variants={itemVariants}>
            <motion.button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHome /> Back to Home
            </motion.button>

            <motion.button
              onClick={handleDownload}
              disabled={loading || !amountCents}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDownload /> Download Receipt
            </motion.button>
          </motion.div>

          <motion.div className="mt-8 text-sm text-gray-500" variants={itemVariants}>
            Redirecting to home in{" "}
            <motion.span
              className="font-bold text-emerald-600"
              key={countdown}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {countdown}
            </motion.span>{" "}
            seconds...
          </motion.div>

          {/* Optional: tiny status line for debugging persistence */}
          {!loading && (
            <p className="mt-4 text-xs text-gray-400">
              {saved ? "Saved to database." : "Saving…"}
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
