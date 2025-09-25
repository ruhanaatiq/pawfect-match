import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String }, // optional for social-only accounts
    photoURL: { type: String },     // ✅ avatar used in navbar
    role: { type: String, enum: ["user", "admin", "shelter"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
