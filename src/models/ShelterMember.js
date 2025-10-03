import mongoose from "mongoose";
const { Schema } = mongoose;

const ShelterMemberSchema = new Schema(
  {
    shelterId: { type: Schema.Types.ObjectId, ref: "Shelter", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    role: {
      type: String,
      enum: ["shelter_owner", "shelter_manager", "shelter_staff", "shelter_volunteer"],
      required: true,
    },
  },
  { timestamps: true }
);

ShelterMemberSchema.index({ shelterId: 1, userId: 1 }, { unique: true });

export default mongoose.models.ShelterMember ||
  mongoose.model("ShelterMember", ShelterMemberSchema);
