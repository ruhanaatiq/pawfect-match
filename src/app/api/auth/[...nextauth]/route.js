// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
