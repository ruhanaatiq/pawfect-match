// src/lib/mongoose.js  (server-only)
import mongoose from "mongoose";

const { MONGODB_URI, DB_NAME } = process.env;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI. Add it to .env.local (and Vercel envs).");
}

// Reuse the connection across HMR/Turbopack reloads
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: DB_NAME || "pawfectMatch",
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
