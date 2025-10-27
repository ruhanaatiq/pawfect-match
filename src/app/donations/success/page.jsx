"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaHeart, FaHome, FaDownload } from "react-icons/fa";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const sessionId = searchParams.get("session_id");

  // canonical receipt state (loaded from server)
  const [loading, setLoading] = useState(true);
  const [amountCents, setAmountCents] = useState(0);
  const [donationType, setDonationType] = useState("one-time"); // "one-time" | "monthly"
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");

  const [saved, setSaved] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const hasSaved = useRef(false);

  // Fetch canonical checkout session details from server (no PII in URL)
  useEffect(() => {
    async function loadSession() {
      if (!sessionId) {
        // No session id → bounce home
        router.replace("/");
        return;
      }
      try {
        const res = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { Accept: "application/json" },
        });

        const ct = res.headers.get("content-type") || "";
        if (!res.ok || !ct.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Failed to load session: ${res.status} ${text.slice(0, 200)}`);
        }

        const data = await res.json();
        // data expected from server route (see below):
        // { amount_total, mode, customer_email, customer_name }
        setAmountCents(Number(data?.amount_total || 0));
        setDonationType(data?.mode === "subscription" ? "monthly" : "one-time");
        setDonorEmail(data?.customer_email || session?.user?.email || "");
        setDonorName(data?.customer_name || session?.user?.name || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Save donation exactly once (after we have amount + type)
  useEffect(() => {
    async function saveDonation() {
      if (loading) return;
      if (hasSaved.current) return;
      if (!sessionId || !amountCents) return;

      hasSaved.current = true;
      try {
        const res = await fetch("/api/donations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            sessionId,
            amount: amountCents / 100,
            donationType,
            email: donorEmail || null,
            name: donorName || null,
          }),
        });

        const ct = res.headers.get("content-type") || "";
        if (!res.ok || !ct.includes("application/json")) {
          const text = await res.text();
          throw new Error(text.slice(0, 200));
        }

        const json = await res.json();
        if (json?.success) setSaved(true);
        else console.error("Save donation failed:", json?.error || json);
      } catch (e) {
        console.error("Error saving donation:", e);
      }
    }
    saveDonation();
  }, [loading, sessionId, amountCents, donationType, donorEmail, donorName]);

  // Confetti (nice & short)
  useEffect(() => {
    const duration = 1000;
    const end = Date.now() + duration;
    const id = setInterval(() => {
      if (Date.now() >= end) return clearInterval(id);
      confetti({
        particleCount: 10,
        spread: 50,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Countdown → home
  useEffect(() => {
    const id = setInterval(() => setCountdown((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (countdown === 0) router.push("/");
  }, [countdown, router]);

  const handleDownload = async () => {
    // dynamic import to avoid SSR build errors
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const amountUsd = (amountCents / 100).toFixed(2);
    const today = new Date().toLocaleString();

    doc.setFontSize(20);
    doc.text("Donation Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Amount: $${amountUsd}`, 20, 40);
    doc.text(`Type: ${donationType === "monthly" ? "Monthly" : "One-time"}`, 20, 50);
    doc.text(`Transaction ID: ${sessionId}`, 20, 60);
    doc.text(`Date: ${today}`, 20, 70);
    if (donorName) doc.text(`Donor: ${donorName}`, 20, 80);
    if (donorEmail) doc.text(`Email: ${donorEmail}`, 20, 90);

    doc.save(`donation-receipt-${sessionId}.pdf`);
  };

  const amountUsd = (amountCents / 100).toFixed(2);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center" variants={itemVariants}>
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-4" variants={itemVariants}>
            Thank You!
          </motion.h1>

          <motion.p className="text-xl text-gray-600 mb-2" variants={itemVariants}>
            Your donation was successful!
          </motion.p>

          <motion.p className="text-gray-500 mb-8" variants={itemVariants}>
            You're making a real difference in the lives of rescued pets.
          </motion.p>

          {/* Amount card */}
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

          {/* Impact */}
          <motion.div className="bg-pink-50 rounded-2xl p-6 mb-8" variants={itemVariants}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <FaHeart className="text-red-600 text-3xl mx-auto mb-3" />
            </motion.div>
            <h3 className="font-bold text-gray-800 mb-2">Your Impact</h3>
            <p className="text-gray-700">
              Your generous donation will help provide food, shelter, and medical care for pets in need.
            </p>
          </motion.div>

          {/* Actions */}
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

          {/* Fun stats */}
          <motion.div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200" variants={itemVariants}>
            {[
              { emoji: "🐶", label: "Pets Helped" },
              { emoji: "❤️", label: "Saved Lives" },
              { emoji: "🏠", label: "Forever Homes" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.08 }}>
                <motion.div className="text-2xl font-bold text-emerald-600" whileHover={{ scale: 1.2, rotate: 5 }}>
                  {stat.emoji}
                </motion.div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Auto redirect */}
          <motion.div className="mt-8 text-sm text-gray-500" variants={itemVariants}>
            Redirecting to home in{" "}
            <motion.span
              className="font-bold text-emerald-600"
              key={countdown}
              initial={{ scale: 1.5, color: "#10b981" }}
              animate={{ scale: 1, color: "#059669" }}
              transition={{ duration: 0.3 }}
            >
              {countdown}
            </motion.span>{" "}
            seconds...
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
