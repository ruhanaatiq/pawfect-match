// src/app/api/debug/session/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
export async function GET() {
  const s = await auth();
  return NextResponse.json({ session: s });
}
