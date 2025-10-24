// components/DonationSection.jsx
"use client";
import { useState } from "react";
import { FaHeart, FaDog, FaMedkit, FaHome, FaCheck } from "react-icons/fa";
// import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Initialize Stripe (use your publishable key)
// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// );

export default function DonationSection() {
   const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one-time"); // 'one-time' or 'monthly'
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  // console.log(session?.user?.name)

  // Predefined donation options
  const donationOptions = [
    {
      amount: 10,
      label: "Food for 1 week",
      icon: FaDog,
      color: "bg-blue-100 text-blue-600",
    },
    {
      amount: 15,
      label: "Vet checkup",
      icon: FaMedkit,
      color: "bg-green-100 text-green-600",
    },
    {
      amount: 30,
      label: "Shelter support",
      icon: FaHome,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const handleDonation = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

    if (!amount || amount < 1) {
      toast.error("Please enter a valid donation amount");
      return;
    }
  
        if (status === "unauthenticated") {
          router.push("/login");
          return
        }
     
    setLoading(true);

    try {
      // Call your API to create payment intent
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          donationType: donationType,
          email: session?.user?.email || "Anonymous",
          name: session?.user?.name || "Anonymous Donor",
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error(error);
        console.log(error);
        setLoading(false);
        return;
      }

      // ✅ redirect manually
      window.location.href = url;

      // const { clientSecret, error } = await response.json();

      // if (error) {
      //   toast.error(error);
      //   setLoading(false);
      //   return;
      // }

      // // Redirect to Stripe Checkout
      // const stripe = await stripePromise;
      // const { error: stripeError } = await stripe.redirectToCheckout({
      //   sessionId: clientSecret,
      // });

      if (stripeError) {
        toast.error(stripeError.message);
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast.error("Failed to process donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 lg:p-10 xl:p-20 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-2">
          Make a Donation
          <PawPrint size={28} className="text-yellow-500 font-bold" />
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Every contribution helps feed, shelter, and provide medical care for
          pets in need.
        </p>
      </div>

      {/* Donation Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className="relative inline-flex bg-gray-100 p-1 rounded-full">
          {/* 🟢 Animated background highlight */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-white shadow-md ${
              donationType === "one-time" ? "left-1" : "left-1/2"
            }`}
          />

          {/* Buttons */}
          <button
            onClick={() => setDonationType("one-time")}
            className={`relative z-10 px-6 py-2 rounded-full font-semibold transition-all ${
              donationType === "one-time"
                ? "text-emerald-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            One-time
          </button>
          <button
            onClick={() => setDonationType("monthly")}
            className={`relative z-10 px-6 py-2 rounded-full font-semibold transition-all ${
              donationType === "monthly"
                ? "text-emerald-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      {/* Predefined Amount Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {donationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedAmount === option.amount && !customAmount;

          return (
            <button
              key={option.amount}
              onClick={() => {
                setSelectedAmount(option.amount);
                setCustomAmount("");
              }}
              className={`p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-103 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-lg"
                  : "border-gray-200 hover:border-emerald-300 bg-white"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center mx-auto mb-3`}
              >
                <Icon className="text-xl" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">
                ${option.amount}
              </div>
              <div className="text-sm text-gray-600">{option.label}</div>
              {isSelected && (
                <div className="mt-3 text-emerald-600 font-semibold flex items-center justify-center gap-1">
                  <FaCheck className="text-sm" /> Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Amount */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Or enter custom amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">
            $
          </span>
          <input
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(0);
            }}
            placeholder="Enter amount"
            className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Impact Preview */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl mb-8">
        <h3 className="font-bold text-gray-800 mb-3 text-lg">Your Impact:</h3>
        <div className="space-y-2 text-gray-700">
          <div className="flex items-center gap-2">
            <FaCheck className="text-emerald-500" />
            <span>
              ${customAmount || selectedAmount} can provide{" "}
              {(customAmount || selectedAmount) >= 50
                ? "full shelter support for a week"
                : (customAmount || selectedAmount) >= 25
                ? "a complete vet checkup"
                : "nutritious meals for rescued pets"}
            </span>
          </div>
          {donationType === "monthly" && (
            <div className="flex items-center gap-2">
              <FaCheck className="text-emerald-500" />
              <span className="font-semibold text-emerald-700">
                Monthly support helps{" "}
                {((customAmount || selectedAmount) / 10).toFixed(0)} pets
                continuously!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Donate Button */}
      <button
        onClick={handleDonation}
        disabled={loading || (!selectedAmount && !customAmount)}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all transform cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FaHeart /> Donate ${customAmount || selectedAmount}
            {donationType === "monthly" && " per month"}
          </span>
        )}
      </button>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaCheck className="text-green-500" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCheck className="text-green-500" />
            <span>100% Tax Deductible</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCheck className="text-green-500" />
            <span>Instant Receipt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
