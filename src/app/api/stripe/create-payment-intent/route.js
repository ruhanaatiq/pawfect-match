import { NextResponse } from "next/server";

export async function POST(req) {
  // forward to the unified checkout session route to avoid client changes
  const body = await req.json().catch(() => ({}));
  const res = await fetch(new URL("/api/stripe/create-checkout-session", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}
