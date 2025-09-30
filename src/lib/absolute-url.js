// src/lib/absolute-url.js
import { headers } from "next/headers";

export function absoluteUrl(path = "/") {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
