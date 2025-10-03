"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setPending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Could not send reset link");
      } else {
        setMessage("If an account exists for that email, we sent a reset link.");
      }
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#4C3D3D]">
          Reset your password
        </h1>

        {message && (
          <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-emerald-600 text-white py-3 font-semibold disabled:opacity-50 hover:bg-emerald-700 transition"
          >
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      </div>
    </main>
  );
}
