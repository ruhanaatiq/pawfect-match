"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const RESEND_COOLDOWN_SEC = 60;

export default function VerifyOtpPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(sp.get("email") || "");
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!cooldown) return;
    timerRef.current = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  // keep email in sync if URL changes (optional)
  useEffect(() => {
    const e = sp.get("email");
    if (e && e !== email) setEmail(e);
  }, [sp]);

  // autofocus code input
  const codeRef = useRef(null);
  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  async function resend() {
    setError(""); 
    setInfo("");
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), reason: "verify_email" }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error || "Failed to send code");
        return;
      }
      setInfo("A new code was sent to your email.");
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch {
      setError("Network error while sending the code.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); 
    setInfo(""); 
    setPending(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          reason: "verify_email",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        // surface attemptsLeft if provided
        if (j.attemptsLeft === 0) {
          setError("Too many attempts. Please request a new code.");
        } else if (j.error) {
          setError(
            j.attemptsLeft != null
              ? `${j.error} (${j.attemptsLeft} attempts left)`
              : j.error
          );
        } else {
          setError("Invalid or expired code");
        }
      } else {
        setInfo("Email verified! Redirecting to login…");
        // Give users a moment to read the success
        setTimeout(() => router.push(`/login?email=${encodeURIComponent(email)}`), 800);
      }
    } catch {
      setError("Network error while verifying the code.");
    } finally {
      setPending(false);
    }
  }

  function onChangeCode(v) {
    // only digits, max 6
    const cleaned = v.replace(/\D/g, "").slice(0, 6);
    setCode(cleaned);
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#4C3D3D]">
          Verify your email
        </h1>

        {info && (
          <div className="mb-3 rounded-md bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-md bg-red-100 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="mt-1 w-full rounded-lg border p-3"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">6-digit code</label>
            <input
              ref={codeRef}
              value={code}
              onChange={(e) => onChangeCode(e.target.value)}
              required
              inputMode="numeric"
              pattern="\d{6}"
              className="mt-1 w-full tracking-widest text-center text-xl rounded-lg border p-3"
              placeholder="••••••"
              autoComplete="one-time-code"
            />
          </div>
          <button
            disabled={pending}
            className="w-full rounded-lg bg-emerald-600 text-white py-3 font-semibold disabled:opacity-50"
          >
            {pending ? "Verifying..." : "Verify"}
          </button>
        </form>

        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="mt-4 w-full rounded-lg border py-2 text-sm hover:bg-emerald-50 disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Didn’t get the email? Check your spam folder or try resending.
        </p>
      </div>
    </main>
  );
}
