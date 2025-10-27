import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    vetId: { type: String, required: true },          // store as string to match client compare
    vetName: String,
    vetPhoto: String,
    specialty: String,
    consultationFee: Number,

    userEmail: { type: String, required: true, index: true },
    userName: String,
    status: { type: String, default: "pending" },     // pending | confirmed | cancelled
  },
  { timestamps: true }
);

// prevent duplicate booking for same vet & user
BookingSchema.index({ vetId: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
