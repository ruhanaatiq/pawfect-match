// src/lib/mongoose.js (server-only)
import mongoose from "mongoose";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;
if (!MONGODB_URI) throw new Error("Add MONGODB_URI to .env.local");

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI, { dbName: "pawfectMatch" });
  isConnected = true;
}
