// src/auth.js
import "server-only";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth, signIn, signOut } = NextAuth(authConfig);
