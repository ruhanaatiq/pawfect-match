// src/app/api/admin/shelters/[id]/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Shelter from "@/models/Shelter";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const forbid = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });
const bad = (msg, code = 400) => NextResponse.json({ error: msg }, { status: code });

/**
 * If your IDs are NOT Mongo ObjectIds (e.g., custom strings),
 * you can remove the isValidObjectId check below.
 */
function validateId(id) {
  if (!id) return "Missing id";
  if (!mongoose.isValidObjectId(id)) return "Invalid id";
  return null;
}

/* ========================= GET /api/admin/shelters/:id ========================= */
export async function GET(_req, { params }) {
  try {
    const session = await auth();
    if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

    await connectDB();

    const id = String(params?.id || "");
    const err = validateId(id);
    if (err) return bad(err, 400);

    const doc = await Shelter.findById(id).lean();
    if (!doc) return bad("Not found", 404);

    // Return the document directly (server page expects this)
    return NextResponse.json({ ...doc, _id: String(doc._id) });
  } catch (e) {
    return bad(e.message || "Server error", 500);
  }
}

/* ======================== PATCH /api/admin/shelters/:id ======================== */
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

    await connectDB();

    const id = String(params?.id || "");
    const err = validateId(id);
    if (err) return bad(err, 400);

    const body = await req.json().catch(() => ({}));

    // Only allow specific fields to be updated
    const allowed = [
      "name",
      "email",
      "phone",
      "website",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
      "description",
    ];

    const $set = {};
    for (const k of allowed) {
      if (k in body) $set[k] = typeof body[k] === "string" ? body[k].trim() : body[k];
    }

    // If name was provided, it must be non-empty
    if (Object.prototype.hasOwnProperty.call($set, "name") && !$set.name) {
      return bad("Name is required", 422);
    }

    const updated = await Shelter.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).lean();
    if (!updated) return bad("Not found", 404);

    return NextResponse.json({ ok: true, shelter: { ...updated, _id: String(updated._id) } });
  } catch (e) {
    return bad(e.message || "Server error", 500);
  }
}

/* ======================= DELETE /api/admin/shelters/:id ======================= */
export async function DELETE(_req, { params }) {
  try {
    const session = await auth();
    if (!["admin", "superadmin"].includes(session?.user?.role)) return forbid();

    await connectDB();

    const id = String(params?.id || "");
    const err = validateId(id);
    if (err) return bad(err, 400);

    const res = await Shelter.deleteOne({ _id: id });
    if (res.deletedCount !== 1) return bad("Not found", 404);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return bad(e.message || "Server error", 500);
  }
}
