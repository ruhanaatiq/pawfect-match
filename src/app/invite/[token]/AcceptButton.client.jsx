"use client";
import { useState } from "react";
import { signOut, signIn } from "next-auth/react";

export function AcceptInviteButton({ token, redirectTo = "/dashboard/shelter" }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onAccept() {
    setError(""); setPending(true);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || `Failed (${res.status})`); setPending(false); return; }
      await signOut({ redirect: false });
      await signIn(undefined, { callbackUrl: redirectTo });
    } catch (e) { setError(String(e)); setPending(false); }
  }

  return (
    <div className="flex items-center gap-3">
      <button className="btn btn-primary" onClick={onAccept} disabled={pending}>
        {pending ? "Accepting..." : "Accept Invitation"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
