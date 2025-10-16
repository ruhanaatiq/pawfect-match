import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  status: { type: String, default: "Active" }, // Active, Completed, Cancelled
  participants: [participantSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);
