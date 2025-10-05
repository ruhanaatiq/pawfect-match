// src/lib/absolute-url.js
import "server-only";
import { headers } from "next/headers";
export async function absoluteUrl(path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? (process.env.VERCEL ? "https" : "http");
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}${p}`;
}
