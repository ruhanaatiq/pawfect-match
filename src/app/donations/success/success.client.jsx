"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FaHeart, FaHome, FaDownload } from "react-icons/fa";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";

export default function DonationSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const sessionId = searchParams.get("session_id");
  const amount = searchParams.get("amount");
  const type = searchParams.get("type");
  const name = searchParams.get("name");
  const email = searchParams.get("email");

  const [saved, setSaved] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const hasSaved = useRef(false);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Donation Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Amount: $${amount || "-"}`, 20, 40);
    doc.text(`Type: ${type || "-"}`, 20, 50);
    doc.text(`Transaction ID: ${sessionId || "-"}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
    doc.text(`Donor: ${name || "-"}`, 20, 80);
    doc.text(`Email: ${email || "-"}`, 20, 90);
    doc.save(`donation-receipt-${sessionId || "receipt"}.pdf`);
  };

  // Save once
  useEffect(() => {
    if (session && sessionId && amount && !hasSaved.current) {
      hasSaved.current = true;
      (async () => {
        try {
          const res = await fetch("/api/donations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              amount: parseFloat(amount),
              donationType: type,
              email,
              name,
            }),
          });
          const j = await res.json();
          if (j?.success) setSaved(true);
          else console.error("Failed to save donation:", j?.error);
        } catch (e) {
          console.error("Error saving donation:", e);
        }
      })();
    }
  }, [session, sessionId, amount, type, email, name]);

  // Confetti (client-only)
  useEffect(() => {
    const duration = 1000;
    const end = Date.now() + duration;
    const id = setInterval(() => {
      if (Date.now() > end) return clearInterval(id);
      confetti({
        particleCount: 10,
        spread: 50,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Countdown + redirect
  useEffect(() => {
    const id = setInterval(() => setCountdown((n) => Math.max(n - 1, 0)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (countdown === 0) router.push("/");
  }, [countdown, router]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, when: "beforeChildren", staggerChildren: 0.08 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <motion.div className="max-w-2xl w-full" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center" variants={itemVariants}>
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-4" variants={itemVariants}>
            Thank You!
          </motion.h1>
          <motion.p className="text-xl text-gray-600 mb-2" variants={itemVariants}>
            Your donation was successful!
          </motion.p>
          <motion.p className="text-gray-500 mb-8" variants={itemVariants}>
            You’re making a real difference in the lives of rescued pets.
          </motion.p>

          {amount && (
            <motion.div className="bg-emerald-50 rounded-2xl p-6 mb-8" variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <motion.div
                className="text-5xl font-bold text-emerald-600 mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
              >
                ${amount}
              </motion.div>
              <p className="text-gray-600 mb-2">
                {type === "monthly" ? "Monthly Donation" : "One-time Donation"}
              </p>
            </motion.div>
          )}

          <motion.div className="bg-pink-50 rounded-2xl p-6 mb-8" variants={itemVariants}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}>
              <FaHeart className="text-red-600 text-3xl mx-auto mb-3" />
            </motion.div>
            <h3 className="font-bold text-gray-800 mb-2">Your Impact</h3>
            <p className="text-gray-700">
              Your generous donation helps provide food, shelter, and medical care for pets in need. 🐾
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-4 mb-6" variants={itemVariants}>
            <motion.button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHome /> Back to Home
            </motion.button>
            <motion.button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDownload /> Download Receipt
            </motion.button>
          </motion.div>

          <motion.div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200" variants={itemVariants}>
            {[
              { emoji: "🐶", label: "Pets Helped" },
              { emoji: "❤️", label: "Saved Lives" },
              { emoji: "🏠", label: "Forever Homes" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.1 }}>
                <motion.div className="text-2xl font-bold text-emerald-600" whileHover={{ scale: 1.2, rotate: 5 }}>
                  {s.emoji}
                </motion.div>
                <div className="text-sm text-gray-600">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="mt-8 text-sm text-gray-500" variants={itemVariants}>
            Redirecting to home in{" "}
            <motion.span className="font-bold text-emerald-600" key={countdown} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
              {countdown}
            </motion.span>{" "}
            seconds…
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
