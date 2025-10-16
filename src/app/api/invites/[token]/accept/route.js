// app/api/invites/[token]/accept/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Shelter from "@/models/Shelter";
import ShelterInvite from "@/models/ShelterInvite";
// (optional) import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- helpers ---------- */
function normalizeEmail(e = "") {
  e = String(e || "").trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at === -1) return e;
  let local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const plus = local.indexOf("+");
    if (plus !== -1) local = local.slice(0, plus);
    local = local.replace(/\./g, "");
  }
  return `${local}@${domain}`;
}
function sha256Hex(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(_req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1) Lookup invite
    const tokenHash = sha256Hex(params.token);
    const invite = await ShelterInvite.findOne({ tokenHash }).lean();

    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.status === "revoked")
      return NextResponse.json({ error: "Invite revoked" }, { status: 400 });
    if (invite.status === "accepted")
      return NextResponse.json({ error: "Invite already accepted" }, { status: 400 });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      await ShelterInvite.updateOne({ _id: invite._id }, { $set: { status: "expired" } });
      return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }

    // 2) Email match
    const sessionEmail = normalizeEmail(session.user.email);
    const invitedEmail = normalizeEmail(invite.email);
    if (!sessionEmail || sessionEmail !== invitedEmail) {
      return NextResponse.json(
        { error: "Email mismatch", details: { invitedEmail: invite.email, sessionEmail: session.user.email } },
        { status: 403 }
      );
    }

    // 3) Load user (by id first, then email)
    let user = null;
    if (session.user.id) user = await User.findById(session.user.id);
    if (!user) user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 4) Prepare atomic shelter update based on role
    const baseFilter = { _id: invite.shelterId };
    const ownerSet =
      invite.role === "owner"
        ? { ownerId: user._id }
        : {}; // allow takeover only if no owner? add "ownerId: { $exists: false }" in filter if needed

    const rolePush =
      invite.role === "manager"
        ? { $addToSet: { managers: user._id } }
        : invite.role === "owner"
        ? {} // owner handled via $set above
        : { $addToSet: { staff: user._id } };

    // Policy: activate when an OWNER accepts (change if you want “activate on first member”)
    const statusSet =
      invite.role === "owner"
        ? { status: "active", activatedAt: new Date() }
        : {}; 
        // If you prefer "activate when first member joins":
        // ? { status: "active", activatedAt: new Date() } : {};

    // 5) Execute atomic shelter update
    const update = {
      $set: { ...ownerSet, ...statusSet },
      ...(Object.keys(rolePush).length ? rolePush : {}),
    };

    const updatedShelter = await Shelter.findOneAndUpdate(baseFilter, update, {
      new: true,
      lean: true,
    });
    if (!updatedShelter) return NextResponse.json({ error: "Shelter not found" }, { status: 404 });

    // 6) Upgrade user role (if not already)
    if (user.role !== "shelter") {
      user.role = "shelter";
      await user.save();
    }

    // 7) Mark invite accepted
    await ShelterInvite.updateOne(
      { _id: invite._id },
      { $set: { status: "accepted", acceptedAt: new Date(), acceptedByUserId: user._id } }
    );

    // 8) (optional) Revalidate public shelter page if you use ISR
    // try { revalidatePath(`/shelters/${updatedShelter.slug}`); } catch {}

    // With JWT sessions, the updated role shows after next login/refresh.
    return NextResponse.json({
      ok: true,
      needReauth: true,
      shelter: { ...updatedShelter, _id: String(updatedShelter._id) },
    });
  } catch (err) {
    console.error("Accept invite failed:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
