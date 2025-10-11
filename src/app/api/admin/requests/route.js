// src/app/api/admin/requests/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";
// If your model file is "Pet.js", use "@/models/Pet"; if it's "Pets.js", keep as is:
import Pet from "@/models/Pets";

import { requireAdmin, respond } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["pending", "approved", "rejected"]);

/** GET /api/admin/requests
 *  Query params:
 *    page=1&pageSize=10
 *    status=pending|approved|rejected
 *    q=free text (petName/applicant/message)
 *    from=2025-09-01  (optional createdAt >=)
 *    to=2025-09-30    (optional createdAt <=, inclusive to end-of-day)
 */
export async function GET(req) {
  try {
    await connectDB();

    const { session, response } = await requireAdmin();
    if (!session) return response;

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("pageSize") || "10", 10))
    );

    const rawStatus = searchParams.get("status");
    const status = rawStatus ? String(rawStatus).toLowerCase() : null;

    const q = searchParams.get("q")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query = {};
    if (status && ALLOWED.has(status)) query.status = status;

    if (q) {
      query.$or = [
        { petName: { $regex: q, $options: "i" } },
        { "applicant.fullName": { $regex: q, $options: "i" } },
        { "applicant.email": { $regex: q, $options: "i" } },
        { "applicant.phone": { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
      ];
    }

    if (from || to) {
      const range = {};
      if (from) {
        const d = new Date(from);
        if (!isNaN(d)) range.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        if (!isNaN(d)) {
          d.setHours(23, 59, 59, 999);
          range.$lte = d;
        }
      }
      if (Object.keys(range).length) query.createdAt = range;
    }

    const total = await AdoptionRequest.countDocuments(query);

    const items = await AdoptionRequest.find(query, {
      petId: 1,
      status: 1,
      note: 1,
      message: 1,
      createdAt: 1,
      petName: 1,
      applicant: 1,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    // Join basic pet info
    const petIds = [...new Set(items.map(i => i?.petId).filter(Boolean).map(String))];
    const pets = petIds.length
      ? await Pet.find({ _id: { $in: petIds } }, { species: 1, breed: 1, name: 1 }).lean()
      : [];
    const petMap = new Map(pets.map(p => [String(p._id), p]));

    const data = items.map(i => ({
      ...i,
      _id: String(i._id),
      petId: i.petId ? String(i.petId) : null,
      pet: i.petId ? (petMap.get(String(i.petId)) || null) : null,
    }));

    return NextResponse.json({ total, page, pageSize, items: data });
  } catch (err) {
    console.error("[GET /api/admin/requests] error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/** PATCH /api/admin/requests
 *  Body: { ids: string[], status: "pending"|"approved"|"rejected", note?: string }
 *  Bulk update + audit trail
 */
export async function PATCH(req) {
  try {
    await connectDB();

    const { session, response } = await requireAdmin();
    if (!session) return response;

    const body = await req.json().catch(() => ({}));
    const { ids, status: rawStatus, note: rawNote } = body;

    const idsArr = Array.isArray(ids) ? ids.filter(Boolean).map(String) : [];
    if (!idsArr.length) return respond(400, { error: "ids required (non-empty array)" });
    if (idsArr.length > 500) return respond(400, { error: "too many ids (max 500)" });

    const status = String(rawStatus || "").toLowerCase();
    if (!ALLOWED.has(status)) return respond(400, { error: "invalid status" });

    const note = typeof rawNote === "string" ? rawNote.trim() : undefined;

    // Find current statuses for audit trail
    const current = await AdoptionRequest.find(
      { _id: { $in: idsArr } },
      { _id: 1, status: 1 }
    ).lean();
    const fromMap = new Map(current.map(d => [String(d._id), d.status || null]));

    const now = new Date();
    const actor = {
      id: session.user?._id || session.user?.id || null,
      name: session.user?.name || null,
      email: session.user?.email || null,
      role: session.user?.role || null,
    };

    const ops = idsArr.map(id => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: { status, ...(note ? { note } : {}) },
          $push: {
            audit: {
              at: now,
              action: "status_change",
              from: fromMap.get(id) || null,
              to: status,
              note: note || null,
              byUserId: actor.id,
              byName: actor.name,
              byEmail: actor.email,
              byRole: actor.role,
            },
          },
        },
      },
    }));

    const res = await AdoptionRequest.bulkWrite(ops, { ordered: false });

    // Normalize bulkWrite result across mongoose versions
    const matched =
      res?.matchedCount ??
      res?.nMatched ??
      res?.result?.nMatched ??
      0;

    const modified =
      res?.modifiedCount ??
      res?.nModified ??
      res?.result?.nModified ??
      0;

    return NextResponse.json({ ok: true, matched, modified, status, ids: idsArr });
  } catch (err) {
    console.error("[PATCH /api/admin/requests] error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
