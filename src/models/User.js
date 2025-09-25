import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String }, // optional for social-only accounts
    photoURL: { type: String },
    role: { type: String, enum: ["user", "admin", "shelter"], default: "user" },
    emailVerifiedAt: { type: Date, default: null }, // ✅ verification flag
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
