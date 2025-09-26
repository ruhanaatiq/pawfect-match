"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(sp.get("email") || "");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const pwRef = useRef(null);

  useEffect(() => { pwRef.current?.focus(); }, []);
  useEffect(() => {
    const e = sp.get("email");
    if (e && e !== email) setEmail(e);
  }, [sp, email]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setInfo("");
    if (pw1.length < 6) return setError("Password must be at least 6 characters.");
    if (pw1 !== pw2)   return setError("Passwords do not match.");

    setPending(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          token: sp.get("token") || "",
          password: pw1.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setError(j.error || "Reset failed");
      else {
        setInfo("Password updated. Redirecting to login…");
        setTimeout(() => router.push(`/login?email=${encodeURIComponent(email)}`), 900);
      }
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#4C3D3D]">Choose a new password</h1>
        {info && <div className="mb-3 rounded-md bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{info}</div>}
        {error && <div className="mb-3 rounded-md bg-red-100 text-red-700 px-3 py-2 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              value={email} onChange={(e) => setEmail(e.target.value)} required type="email"
              className="mt-1 w-full rounded-lg border p-3" placeholder="you@example.com" autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">New password</label>
            <input
              ref={pwRef} type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} required
              className="mt-1 w-full rounded-lg border p-3" placeholder="••••••"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Confirm password</label>
            <input
              type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required
              className="mt-1 w-full rounded-lg border p-3" placeholder="••••••"
            />
          </div>
          <button disabled={pending} className="w-full rounded-lg bg-emerald-600 text-white py-3 font-semibold disabled:opacity-50">
            {pending ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
