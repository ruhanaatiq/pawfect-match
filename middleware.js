// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Which prefixes are protected, and which role is required
const RULES = [
  { prefix: "/admin/", role: "admin" },
  { prefix: "/api/admin/", role: "admin" },
  { prefix: "/dashboard/shelter/", role: "shelter" },
  { prefix: "/api/shelter/", role: "shelter" },
];

export async function middleware(req) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Find matching rule (if any)
  const rule = RULES.find((r) => path.startsWith(r.prefix));
  if (!rule) {
    // Public route → allow
    return NextResponse.next();
  }

  const isApi = path.startsWith("/api/");
  const token = await getToken({ req });

  // Not logged in
  if (!token) {
    if (isApi) {
      // APIs should return JSON, not redirect
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pages: redirect to login, preserve return path
    const login = new URL("/login", url);
    login.searchParams.set("redirect", path + url.search);
    return NextResponse.redirect(login);
  }

  // Role check
  if (token.role !== rule.role) {
    if (isApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/403", url));
  }

  // All good
  return NextResponse.next();
}

// Only protect these paths; everything else stays public
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/shelter/:path*",
    "/api/shelter/:path*",
  ],
};
