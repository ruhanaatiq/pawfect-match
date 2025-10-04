// src/app/api/admin/users/[id]/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export const runtime = "nodejs";

function forbid() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(req, { params }) {
  const session = await auth();
  const adminRole = session?.user?.role;
  if (!["admin", "superadmin"].includes(adminRole)) return forbid();

  await connectDB();

  const body = await req.json();
  const { role, status, fullName } = body || {};

  // Prevent privilege escalation: admins cannot modify superadmins, and only superadmin can make superadmin.
  const target = await User.findById(params.id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.role === "superadmin" && adminRole !== "superadmin") {
    return forbid();
  }
  if (role === "superadmin" && adminRole !== "superadmin") {
    return forbid();
  }

  if (role) target.role = role;
  if (status) target.status = status;
  if (typeof fullName === "string") target.fullName = fullName;

  await target.save();

  const safe = target.toObject();
  delete safe.passwordHash;

  return NextResponse.json({ user: safe });
}

export async function DELETE(_req, { params }) {
  const session = await auth();
  const adminRole = session?.user?.role;
  if (!["admin", "superadmin"].includes(adminRole)) return forbid();

  await connectDB();

  const target = await User.findById(params.id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.role === "superadmin") return forbid();

  await User.deleteOne({ _id: target._id });
  return NextResponse.json({ ok: true });
}
