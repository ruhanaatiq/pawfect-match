// src/app/invite/[token]/page.jsx
import AcceptButton from "./AcceptButton.client";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function base() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function InvitePage({ params }) {
  const { token } = await params;            // ← IMPORTANT

  const res = await fetch(`${base()}/api/invites/${token}`, { cache: "no-store" });
  const info = await res.json();

  if (!res.ok || !info.valid) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-2">Invitation</h1>
        <p className="text-red-600">This invite is {info?.reason || "invalid"}.</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-semibold">Join {info.shelter}</h1>
      <p className="mt-2">Invited email: <b>{info.email}</b></p>
      <p className="mt-1">Role on join: <b>{info.role}</b></p>

      <div className="mt-6">
        <AcceptButton token={token} invitedEmail={info.email} />
      </div>

      <p className="mt-3 text-sm text-gray-500">
        You must be signed in with <b>{info.email}</b> for this to work.
      </p>
    </main>
  );
}
