import mongoose from "mongoose";

const ResetTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
    createdIp: String,
  },
  { timestamps: true }
);

// TTL cleanup for expired tokens
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.ResetToken ||
  mongoose.model("ResetToken", ResetTokenSchema);
