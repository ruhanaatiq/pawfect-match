import mongoose, { Schema } from "mongoose";

const OtpTokenSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attemptsLeft: { type: Number, default: 5 },
    reason: { type: String, enum: ["verify_email", "login"], default: "verify_email" },
    createdIp: { type: String },
  },
  { timestamps: true }
);

// TTL index (optional – auto-expire) if you want:
// OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpToken || mongoose.model("OtpToken", OtpTokenSchema);
