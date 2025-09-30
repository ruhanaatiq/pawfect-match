// src/app/api/admin/requests/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AdoptionRequest from "@/models/AdoptionRequest";
import Pet from "@/models/Pets"; // ⬅️ Ensure this matches your actual file name (Pet vs Pets)
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["pending", "approved", "rejected"]);

/** GET /api/admin/requests
 *  Query params:
 *    page=1&pageSize=10
 *    status=pending|approved|rejected
 *    q=free text (petName/applicant/message)
 *    from=2025-09-01  (optional createdAt >=)
 *    to=2025-09-30    (optional createdAt <=)
 */
export async function GET(req) {
  try {
    await connectDB();

    // (Optional) admin guard
    // const session = await auth();
    // if (!session || session.user?.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("pageSize") || "10", 10))
    );

    // Normalize status to lowercase
    const rawStatus = searchParams.get("status");
    const status = rawStatus ? rawStatus.toLowerCase() : null;

    const q = searchParams.get("q")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query = {};
    if (status && ALLOWED.has(status)) {
      query.status = status; // store lowercase in DB for consistency
    }

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
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        // include the whole "to" day if only a date is given
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          toDate.setHours(23, 59, 59, 999);
          query.createdAt.$lte = toDate;
        }
      }
    }

    const total = await AdoptionRequest.countDocuments(query);

    const items = await AdoptionRequest.find(
      query,
      {
        // projection: only what the table needs
        petId: 1,
        status: 1,
        note: 1,
        message: 1,
        createdAt: 1,
        petName: 1,
        applicant: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    // Build pet map (skip null/undefined)
    const petIds = [...new Set(items.map(i => i?.petId).filter(Boolean).map(String))];
    const pets = petIds.length
      ? await Pet.find(
          { _id: { $in: petIds } },
          { species: 1, breed: 1, name: 1 }
        ).lean()
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
 *  Bulk-update + audit trail with 'from' and 'to'
 */
export async function PATCH(req) {
  try {
    await connectDB();

    // (Optional) admin guard
    // const session = await auth();
    // if (!session || session.user?.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }
    // const actor = {
    //   id: session.user.id,
    //   name: session.user.name,
    //   email: session.user.email,
    // };

    const { ids, status: rawStatus, note: rawNote } = await req.json().catch(() => ({}));

    const idsArr = Array.isArray(ids) ? ids.filter(Boolean).map(String) : [];
    if (!idsArr.length) {
      return NextResponse.json({ error: "ids required (non-empty array)" }, { status: 400 });
    }
    if (idsArr.length > 500) {
      return NextResponse.json({ error: "too many ids (max 500)" }, { status: 400 });
    }

    const status = String(rawStatus || "").toLowerCase();
    if (!ALLOWED.has(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    const note = typeof rawNote === "string" ? rawNote.trim() : undefined;
    // If you want to enforce a reason on reject, uncomment:
    // if (status === "rejected" && !note) {
    //   return NextResponse.json({ error: "reason (note) required when rejecting" }, { status: 400 });
    // }

    // Grab current statuses to record 'from' in audit
    const current = await AdoptionRequest.find(
      { _id: { $in: idsArr } },
      { _id: 1, status: 1 }
    ).lean();
    const fromMap = new Map(current.map(d => [String(d._id), d.status || null]));

    const now = new Date();
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
              // byUserId: actor?.id || null,
              // byName: actor?.name || null,
              // byEmail: actor?.email || null,
            },
          },
        },
      },
    }));

    const res = await AdoptionRequest.bulkWrite(ops, { ordered: false });

    const matched =
      res?.matchedCount ??
      res?.nMatched ??
      Object.values(res?.result?.nMatched || {}).reduce((a, b) => a + b, 0) ??
      0;

    const modified =
      res?.modifiedCount ??
      res?.nModified ??
      Object.values(res?.result?.nModified || {}).reduce((a, b) => a + b, 0) ??
      0;

    return NextResponse.json({ ok: true, matched, modified, status, ids: idsArr });
  } catch (err) {
    console.error("[PATCH /api/admin/requests] error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
