import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true }, // clearer than just 'name'
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String }, // optional for social accounts
    photoURL: { type: String },

    role: {
      type: String,
      enum: ["user", "shelter", "admin", "superadmin"],
      default: "user",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
      index: true,
    },

    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
