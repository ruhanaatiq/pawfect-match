// src/auth.js
import "server-only";
import { getServerSession } from "next-auth";
import authConfig from "./auth.config";

// Server helper you can call in RSCs / route handlers:
export async function auth() {
  return getServerSession(authConfig);
}

// (signIn/signOut come from "next-auth/react" on the client in v4)
