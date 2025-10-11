// src/app/dashboard/shelter/_server.ts (or .js)
import { headers } from "next/headers";

// Infer absolute URL and forward cookies
export function absoluteUrl(path = "/") {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return new URL(path, env).toString();
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host  = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return new URL(path, `${proto}://${host}`).toString();
}

export async function getMyShelter() {
  const h = headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(absoluteUrl("/api/shelters/mine"), {
    cache: "no-store",
    headers: { cookie },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load shelter (${res.status})`);
  const data = await res.json();
  return data?.shelter ?? data;
}
