import { Schema, model, models } from "mongoose";

const CampaignSchema = new Schema(
  {
    petId: { type: Schema.Types.ObjectId, ref: "Pet", index: true, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    goal: { type: Number, default: 0 },
    raised: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["Active", "Completed", "Cancelled", "Pending"], 
      default: "Active" 
    },
    participants: [
      { 
        name: String, 
        email: String, 
        amount: Number, 
        date: { type: Date, default: Date.now } 
      }
    ],
  },
  { timestamps: true }
);

export default models.Campaign || model("Campaign", CampaignSchema);
