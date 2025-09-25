"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // your custom credentials login (keep as-is if you already have /api/auth/login)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Login failed");
        return;
      }

      router.push("/");
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
          <h1 className="mb-6 text-center text-3xl font-bold text-green-700">Login</h1>

          {error && (
            <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Login
            </button>
          </form>

          {/* Social logins */}
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600 mb-3">or continue with</p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full rounded-lg border border-[#4C3D3D] py-3 font-semibold hover:bg-[#4C3D3D] hover:text-white transition"
              >
                Continue with Google
              </button>
              <button
                onClick={() => signIn("github", { callbackUrl: "/" })}
                className="w-full rounded-lg border border-[#4C3D3D] py-3 font-semibold hover:bg-[#4C3D3D] hover:text-white transition"
              >
                Continue with GitHub
              </button>
            </div>
          </div>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-emerald-700 font-medium hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
