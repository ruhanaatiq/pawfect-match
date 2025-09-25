import mongoose, { Schema } from "mongoose";

const AdoptionRequestSchema = new Schema(
  {
    petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
    petName: String,
    applicant: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      city: String,
    },
    household: {
      homeType: String,
      hasOtherPets: Boolean,
    },
    message: String,
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdoptionRequest ||
  mongoose.model("AdoptionRequest", AdoptionRequestSchema);
