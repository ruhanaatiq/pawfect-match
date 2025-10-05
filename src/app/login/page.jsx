"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FaPaw, FaEnvelope, FaLock, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  const notVerified = error?.toLowerCase().includes("email not verified");
  async function handleSubmit(e) {
  e.preventDefault();
  if (isLocked) {
    setError(`Too many failed attempts. Try again in ${lockTime}s.`);
    return;
  }

  setError("");
  setInfo("");
  setPending(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setPending(false);

    if (!res.ok) {
      setError(data.error || "Login failed");

      if (res.status === 403 && data.lockTime) {
        setIsLocked(true);
        setLockTime(data.lockTime);
      } else {
        setAttempts((prev) => {
          const newAttempts = prev + 1;
          if (newAttempts >= 3) {
            setIsLocked(true);
            setLockTime(60);
          }
          return newAttempts;
        });
      }

      return;
    }

    // Success
    setAttempts(0);
    setIsLocked(false);
    setLockTime(0);
    setError("");
    setInfo("Login successful! Redirecting...");
    router.push("/");
  } catch (err) {
      setPending(false);
      setError("Something went wrong. Try again.");
    }
  }
  
  async function resendCode() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setError("");
    setInfo("");

    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reason: "verify_email" }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) setError(j.error || "Failed to send code");
    else setInfo("Verification code sent. Check your inbox.");
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
            Welcome back
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600">
            Log in to continue your adoption journey.
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

          {notVerified && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="font-semibold">Your email isn’t verified.</div>
              <div className="mt-2 flex gap-2">
                <Link
                  href={`/verify-otp?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-white text-sm hover:bg-emerald-700"
                >
                  Verify now
                </Link>
                <button
                  type="button"
                  onClick={resendCode}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-emerald-50"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 pl-10 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
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
                <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
            type="submit"
            disabled={pending || isLocked}
            className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
            {isLocked? `Locked (${lockTime}s)`: pending? "Logging in…": "Log in"}
            </button>
            </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600 mb-3">or continue with</p>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50 transition"
              >
                <FcGoogle size={22} />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50 transition"
              >
                <FaGithub size={22} className="text-gray-800" />
                <span>Continue with GitHub</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link href="/register" className="text-emerald-700 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right: hero panel */}
      <div className="hidden md:flex items-center justify-center p-8 relative">
        <div className="relative w-full h-[520px] max-w-xl rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/login.jpg"
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
              Welcome back, future pet parent!
            </h2>
            <p className="mt-1 text-sm text-white/90">
              Sign in to track favorites, applications, and messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  }
