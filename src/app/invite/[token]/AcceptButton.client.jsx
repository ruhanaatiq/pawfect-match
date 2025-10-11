"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcceptButton({ token, invitedEmail }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function accept() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || `Failed (${res.status})`);
        setLoading(false);
        return;
      }

      // success: send them to their shelter dashboard
      router.push("/dashboard/shelter");
      router.refresh();
    } catch (e) {
      setMsg(e.message || "Failed");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={accept}
        disabled={loading}
        className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
      >
        {loading ? "Accepting…" : "Accept Invitation"}
      </button>
      {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
