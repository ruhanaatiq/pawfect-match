// models/Shelter.js
import { Schema, model, models } from "mongoose";
const ShelterSchema = new Schema({
  name: String,
  ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  email: String,
  phone: String,
  address: String,
  photos: [String],
  status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },  verifiedAt: Date,
}, { timestamps: true });
export default models.Shelter || model("Shelter", ShelterSchema);
