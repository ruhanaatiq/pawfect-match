import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Shelter from "@/models/Shelter";
import ShelterInvite from "@/models/ShelterInvite";

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

/* ---------- POST /api/invites/[token]/accept ---------- */
export async function POST(_req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1) Find invite by token hash
    const rawToken = params.token;
    const tokenHash = sha256Hex(rawToken);
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

    // 2) Email must match (normalized)
    const sessionEmail = normalizeEmail(session.user.email);
    const invitedEmail = normalizeEmail(invite.email);
    if (!sessionEmail || sessionEmail !== invitedEmail) {
      return NextResponse.json(
        { error: "Email mismatch", details: { invitedEmail: invite.email, sessionEmail: session.user.email } },
        { status: 403 }
      );
    }

    // 3) Load user — prefer session.user.id, fallback to email
    let user = null;
    if (session.user.id) {
      user = await User.findById(session.user.id);
    }
    if (!user) {
      user = await User.findOne({ email: session.user.email });
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4) Load shelter
    const shelter = await Shelter.findById(invite.shelterId);
    if (!shelter) return NextResponse.json({ error: "Shelter not found" }, { status: 404 });

    // 5) Upgrade permissions and link user to shelter based on invite.role
    user.role = "shelter";

    shelter.managers = shelter.managers || [];
    shelter.staff = shelter.staff || [];

    if (invite.role === "owner") {
      if (shelter.ownerId && String(shelter.ownerId) !== String(user._id)) {
        return NextResponse.json({ error: "Shelter already has an owner" }, { status: 409 });
      }
      shelter.ownerId = user._id;
    } else if (invite.role === "manager") {
      if (!shelter.managers.find(id => String(id) === String(user._id))) {
        shelter.managers.push(user._id);
      }
    } else {
      if (!shelter.staff.find(id => String(id) === String(user._id))) {
        shelter.staff.push(user._id);
      }
    }

    // 6) Persist & mark invite accepted
    await Promise.all([
      user.save(),
      shelter.save(),
      ShelterInvite.updateOne(
        { _id: invite._id },
        { $set: { status: "accepted", acceptedAt: new Date(), acceptedByUserId: user._id } }
      ),
    ]);

    // With JWT sessions, the new role appears on next login; tell client to reauth
    return NextResponse.json({ ok: true, needReauth: true });
  } catch (err) {
    console.error("Accept invite failed:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
