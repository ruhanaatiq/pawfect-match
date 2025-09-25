"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", photoURL: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

 async function onSubmit(e) {
  e.preventDefault();
  setError("");
  setInfo("");
  setPending(true);

  try {
    // 1) Register user
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 409) setError("Email is already registered.");
      else setError(data.error || "Registration failed.");
      setPending(false);
      return;
    }

    // 2) Auto-send OTP
    const otpRes = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, reason: "verify_email" }),
    });
    const otpData = await otpRes.json().catch(() => ({}));

    if (!otpRes.ok || otpData.sent === false) {
      setInfo(
        "Account created. OTP could not be sent automatically. You can request it on the verification page."
      );
    } else {
      setInfo("Account created. A verification code has been sent to your email.");
    }

    // 3) Clear password from state for security
    setForm(f => ({ ...f, password: "" }));

    // 4) Redirect to OTP verification page
    router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
  } catch (err) {
    console.error("Registration error:", err);
    setError("Something went wrong. Try again.");
  } finally {
    setPending(false);
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-green-700">Create Account</h1>

        {info && (
          <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 text-center">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="Your full name"
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Photo URL</label>
            <input
              name="photoURL"
              value={form.photoURL}
              onChange={onChange}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use 6+ characters. Add a number &amp; symbol for extra security.
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-700 font-medium hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
