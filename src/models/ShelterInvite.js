// models/ShelterInvite.js
import { Schema, model, models } from "mongoose";
const ShelterInviteSchema = new Schema({
  shelterId: { type: Schema.Types.ObjectId, ref: "Shelter", index: true, required: true },
  email: { type: String, required: true, index: true },
  role: { type: String, enum: ["shelter_manager","shelter_staff","shelter_volunteer"], required: true },
  tokenHash: { type: String, required: true },   // store hash, not raw token
  expiresAt: { type: Date, required: true },
  acceptedAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export default models.ShelterInvite || model("ShelterInvite", ShelterInviteSchema);
