// src/lib/mongoose.js
import "server-only";
import mongoose from "mongoose";

// cache across HMR / lambda re-use
let cached = global._mongoose || { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI; // ✅ server-only
  if (!uri) throw new Error("Set MONGODB_URI in .env.local (and Vercel envs)");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || "pawfectMatch", // ✅ consistent name
        bufferCommands: false,
      })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
