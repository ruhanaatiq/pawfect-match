// src/lib/absolute-url.js
import "server-only";
import { headers } from "next/headers";

/**
 * Build an absolute URL for server-side fetch().
 * - If `path` is already absolute (http/https), returns it unchanged.
 * - If NEXT_PUBLIC_BASE_URL is set, uses it.
 * - Otherwise derives proto/host from request headers (works on Vercel).
 */
export function absoluteUrl(path = "/") {
  if (!path) path = "/";
  if (/^https?:\/\//i.test(path)) return path; // already absolute

  const p = path.startsWith("/") ? path : `/${path}`;

  // Prefer explicit env (e.g., https://yourdomain.com)
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  if (envBase) {
    const base = envBase.replace(/\/+$/, ""); // trim trailing slash
    return `${base}${p}`;
  }

  const h = headers(); // sync
  const proto = h.get("x-forwarded-proto") ?? (process.env.VERCEL ? "https" : "http");
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}${p}`;
}
