// src/app/join-shelter/JoinClient.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinClient({ token, shelterId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    try {
      setBusy(true);
      setError("");
      const res = await fetch("/api/shelter/staff/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, shelterId }),
      });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || "Failed to accept invite");
      router.push("/dashboard/shelter/staff");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token || !shelterId) {
    return <div className="p-6">Invalid invite link.</div>;
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-3">
      <h1 className="text-xl font-semibold">Join Shelter</h1>
      <p className="text-sm text-gray-600">
        Click accept to join this shelter. You must be logged in.
      </p>
      {error && (
        <div className="rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}
      <button
        disabled={busy}
        onClick={accept}
        className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy ? "Accepting…" : "Accept Invite"}
      </button>
    </div>
  );
}
