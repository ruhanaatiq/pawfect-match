// src/lib/mongoose.js
import mongoose from "mongoose";

// Don't throw at import time — NextAuth imports this on /api/auth/session
const DB_NAME = process.env.MONGODB_DB || process.env.DB_NAME || "pawfectMatch";

// Reuse connection across reloads
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null, uri: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
  if (!uri) {
    // Throw *inside* the function so callers can catch it; never at top level
    throw new Error("Missing MONGODB_URI (set it in .env.local / Vercel env).");
  }

  if (cached.conn && cached.uri === uri) return cached.conn;

  if (!cached.promise || cached.uri !== uri) {
    cached.uri = uri;
    cached.promise = mongoose
      .connect(uri, { dbName: DB_NAME, bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
