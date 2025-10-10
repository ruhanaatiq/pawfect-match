// src/lib/guard.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Shelter from "@/models/Shelter";

export function respond(status, payload) {
  return NextResponse.json(payload ?? { error: "Error" }, { status });
}

export function unauthorized(msg = "Unauthorized") {
  return respond(401, { error: msg });
}

export function forbid(msg = "Forbidden") {
  return respond(403, { error: msg });
}

export function notFound(msg = "Not found") {
  return respond(404, { error: msg });
}

/**
 * Ensures we have a session and enriches it with _id/role from DB if missing.
 * Returns { session } on success OR { response } on failure.
 */
export async function requireSession() {
  const session = await auth();

  // Enrich session with _id/role if only email is present
  if (!session?.user?._id && session?.user?.email) {
    await connectDB();
    const u = await User.findOne({ email: session.user.email })
      .select("_id role")
      .lean();

    if (u) {
      session.user._id = String(u._id);
      if (!session.user.role && u.role) session.user.role = u.role;
    }
  }

  if (!session?.user?._id) {
    return { response: unauthorized() };
  }
  return { session };
}

/**
 * Admin / Superadmin only.
 */
export async function requireAdmin() {
  const { session, response } = await requireSession();
  if (!session) return { response };

  const isAdmin = ["admin", "superadmin"].includes(session.user?.role);
  if (!isAdmin) return { response: forbid() };

  return { session };
}

/**
 * Shelter access guard.
 * - Admins always pass.
 * - Otherwise, user must be a shelter member with an allowed role.
 *
 * Usage:
 *   const g = await requireShelterAccess(params.id, { allowedRoles: ["owner","manager","staff"] });
 *   if (g.response) return g.response;
 *   // g.shelter, g.memberRole, g.session are available here
 */
export async function requireShelterAccess(
  shelterId,
  { allowedRoles = ["owner", "manager", "staff"] } = {}
) {
  const { session, response } = await requireSession();
  if (!session) return { response };

  await connectDB();
  const shelter = await Shelter.findById(shelterId).lean();
  if (!shelter) return { response: notFound("Shelter not found") };

  const isAdmin = ["admin", "superadmin"].includes(session.user?.role);
  if (isAdmin) return { session, shelter, memberRole: "admin" };

  const member = shelter.members?.find(
    (m) => String(m.userId) === String(session.user._id)
  );
  if (!member || !allowedRoles.includes(member.role)) {
    return { response: forbid() };
  }

  return { session, shelter, memberRole: member.role };
}
