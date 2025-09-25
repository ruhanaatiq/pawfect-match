"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // from email link
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      setPending(false);

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setPending(false);
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
          <h1 className="mb-6 text-center text-3xl font-bold text-green-700">
            Reset Password
          </h1>

          {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 text-center">{error}</div>}
          {message && <div className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700 text-center">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {pending ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
