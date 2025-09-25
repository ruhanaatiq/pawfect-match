// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const url = req.nextUrl;

  // Read session/JWT via NextAuth
  const token = await getToken({ req });

  // If no session, bounce to login with redirect back
  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("redirect", url.pathname + url.search);
    return NextResponse.redirect(login);
  }

  // Require admin role
  if (token.role !== "admin") {
    // You can redirect or return 403 page
    return NextResponse.redirect(new URL("/403", req.url));
    // Or: return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

// Protect both admin pages and admin APIs
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*", // protect admin APIs too
  ],
};
