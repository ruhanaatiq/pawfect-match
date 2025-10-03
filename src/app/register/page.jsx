"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaPaw, FaUser, FaEnvelope, FaLink, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    photoURL: "",
    password: "",
  });
  const [pledge, setPledge] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

<<<<<<< HEAD
  const pwScore = useMemo(() => {
    const p = form.password || "";
    let s = 0;
    if (p.length >= 8) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]/.test(p)) s++;
    return s; // 0–3
  }, [form.password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!pledge) {
      setError("Please accept the Adoption Pledge to continue.");
      return;
    }

    setPending(true);
    try {
      // 1) Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setPending(false);
        return;
      }

      // 2) Auto-send OTP email (non-fatal if it fails)
      const otpRes = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, reason: "verify_email" }),
      });

      if (!otpRes.ok) {
        setInfo(
          "Account created. We couldn't send the code automatically, but you can request it on the next page."
        );
      } else {
        setInfo("Account created. We've sent a verification code to your email.");
      }

      // 3) Redirect to verify page
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError("Something went wrong. Try again.");
=======
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
>>>>>>> 30b4ee4e99da753c68cf1718d704bcfbd1410510
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
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-emerald-50 via-rose-50 to-amber-50 relative">
      {/* Decorative paws */}
      <FaPaw className="hidden md:block absolute left-6 top-6 text-emerald-200/70 text-3xl" />
      <FaPaw className="hidden md:block absolute right-8 bottom-8 text-rose-200/70 text-4xl rotate-12" />

      {/* Left: form card */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur shadow-xl border border-emerald-100 p-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaPaw className="text-emerald-600 text-2xl" />
            <span className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">
              Pawfect Match
            </span>
          </div>
          <h1 className="mb-2 text-center text-3xl font-extrabold text-[#4C3D3D]">
            Create your adopter account
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600">
            Join the community.{" "}
            <span className="text-emerald-700 font-medium">Adopt love.</span>
          </p>

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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-gray-300 pl-10 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 pl-10 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Photo URL
              </label>
              <div className="relative">
                <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="photoURL"
                  value={form.photoURL}
                  onChange={onChange}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-gray-300 pl-10 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-10 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Strength meter */}
              <div className="mt-2 h-1.5 w-full bg-gray-200 rounded">
                <div
                  className={`h-full rounded transition-all ${
                    pwScore === 1
                      ? "w-1/3 bg-red-400"
                      : pwScore === 2
                      ? "w-2/3 bg-amber-400"
                      : pwScore === 3
                      ? "w-full bg-emerald-500"
                      : "w-0"
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use 8+ characters, a number and a symbol for a stronger password.
              </p>
            </div>

            {/* Adoption pledge */}
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={pledge}
                onChange={(e) => setPledge(e.target.checked)}
                className="mt-1 accent-emerald-600"
              />
              <span className="text-gray-700">
                I agree to the <span className="font-medium">Adoption Pledge</span> — to provide a
                safe, loving home and follow responsible pet care.
              </span>
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {pending ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-700 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: hero panel */}
      <div className="hidden md:flex items-center justify-center p-8 relative">
        <div className="relative w-full h-[520px] max-w-xl rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/register.jpeg"
            alt="Happy adopted pets"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur">
              <FaPaw />
              <span className="text-xs tracking-wide">Adopt • Love • Care</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold drop-shadow">
              Find your new best friend
            </h2>
            <p className="mt-1 text-sm text-white/90">
              Join thousands of adopters giving pets a second chance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
