// models/ShelterMember.js
import { Schema, model, models } from "mongoose";
const ShelterMemberSchema = new Schema({
  shelterId: { type: Schema.Types.ObjectId, ref: "Shelter", index: true, required: true },
  userId:    { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  role: { type: String, enum: ["shelter_owner","shelter_manager","shelter_staff","shelter_volunteer"], required: true },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });
ShelterMemberSchema.index({ shelterId: 1, userId: 1 }, { unique: true });
export default models.ShelterMember || model("ShelterMember", ShelterMemberSchema);
