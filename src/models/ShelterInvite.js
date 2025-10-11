// src/models/ShelterInvite.js
import { Schema, model, models } from "mongoose";

const ShelterInviteSchema = new Schema(
  {
    tokenHash: { type: String, unique: true, index: true }, // store hash, not raw token
    email: { type: String, index: true, required: true },
    shelterId: { type: Schema.Types.ObjectId, ref: "Shelter", required: true },
    role: { type: String, enum: ["owner","manager","staff"], default: "staff" },

    invitedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedByEmail: String,

    // lifecycle
    status: { type: String, enum: ["pending","accepted","revoked","expired"], default: "pending", index: true },
    acceptedAt: Date,
    acceptedByUserId: { type: Schema.Types.ObjectId, ref: "User" },

    // expiry
    expiresAt: { type: Date, index: true }, // set TTL via code or index
  },
  { timestamps: true }
);

export default models.ShelterInvite || model("ShelterInvite", ShelterInviteSchema);
