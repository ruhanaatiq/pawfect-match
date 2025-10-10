// src/app/invite/[token]/page.jsx
import { headers } from "next/headers";

async function apiBase() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function InvitePage({ params }) {
  const base = await apiBase();
  const res = await fetch(`${base}/api/invites/${params.token}`, { cache: "no-store" });
  const info = await res.json();

  if (!info.valid) {
    return (
      <main className="max-w-lg mx-auto py-16">
        <h1 className="text-2xl font-semibold">Invitation</h1>
        <p className="mt-4 text-red-600">This invite is {info.reason || "invalid"}.</p>
      </main>
    );
  }

  async function accept() {
    "use server";
    await fetch(`${base}/api/invites/${params.token}/accept`, { method: "POST" });
  }

  return (
    <main className="max-w-lg mx-auto py-16">
      <h1 className="text-2xl font-semibold">Join {info.shelter}</h1>
      <p className="mt-2">Invited email: <b>{info.email}</b></p>
      <p className="mt-1">Role on join: <b>{info.role}</b></p>
      <form action={accept} className="mt-6">
        <button className="px-4 py-2 rounded bg-black text-white">Accept Invitation</button>
      </form>
      <p className="mt-3 text-sm text-gray-500">
        You must be signed in with <b>{info.email}</b> for this to work.
      </p>
    </main>
  );
}
