"use client";
<<<<<<< HEAD
=======

>>>>>>> 30b4ee4e99da753c68cf1718d704bcfbd1410510
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
<<<<<<< HEAD
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setPending(true);
    try {
      const res = await fetch("/api/auth/password/request", {
=======
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
>>>>>>> 30b4ee4e99da753c68cf1718d704bcfbd1410510
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
<<<<<<< HEAD
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setError(j.error || "Could not send reset link");
      else setInfo("If an account exists for that email, we sent a reset link.");
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#4C3D3D]">Reset your password</h1>
        {info && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 text-center">{info}</div>}
        {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 text-center">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@example.com" className="mt-1 w-full rounded-lg border p-3"
            />
          </div>
          <button disabled={pending} className="w-full rounded-lg bg-emerald-600 text-white py-3 font-semibold disabled:opacity-50">
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      </div>
    </main>
=======

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage("Check your email for the reset link!");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
          <h1 className="mb-6 text-center text-3xl font-bold text-green-700">
            Forgot Password
          </h1>

          {error && (
            <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700 text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 py-3 text-white font-semibold hover:bg-green-700 transition"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
>>>>>>> 30b4ee4e99da753c68cf1718d704bcfbd1410510
  );
}
