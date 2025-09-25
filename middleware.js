import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req });
  const url = req.nextUrl;

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("redirect", url.pathname + url.search);
    return NextResponse.redirect(login);
  }
  if (token.role !== "admin") {
    return NextResponse.redirect(new URL("/403", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
