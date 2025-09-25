"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

  const notVerified = error?.toLowerCase().includes("email not verified");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,  // we'll redirect manually
    });

    setPending(false);

    if (result?.error) {
      setError(result.error);   // will show "Email not verified" if blocked in authorize()
      return;
    }
    router.push("/");
  }

  async function resendCode() {
    if (!email) { setError("Enter your email first."); return; }
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
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border-t-4 border-[#4C3D3D] p-8">
          <h1 className="mb-6 text-center text-3xl font-bold text-green-700">Login</h1>

          {info && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 text-center">{info}</div>}
          {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 text-center">{error}</div>}

          {notVerified && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="font-semibold">Your email isn’t verified.</div>
              <div className="mt-2 flex gap-2">
                <a
                  href={`/verify-otp?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-white text-sm hover:bg-emerald-700"
                >
                  Verify now
                </a>
                <button onClick={resendCode} className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-emerald-50">
                  Resend code
                </button>
              </div>
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
              disabled={pending}
              className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {pending ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600 mb-3">or continue with</p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50 transition"
              >
                <FcGoogle size={22} />
                <span>Continue with Google</span>
              </button>
              <button
                onClick={() => signIn("github", { callbackUrl: "/" })}
                className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50 transition"
              >
                <FaGithub size={22} className="text-gray-800" />
                <span>Continue with GitHub</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-emerald-700 font-medium hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
