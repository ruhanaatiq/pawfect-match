import Campaign from "@/models/Campaign";
import { connectDB } from "./mongoose"; // your db connection helper

export async function getAllCampaigns() {
  await connectDB();
  return Campaign.find({}).lean();
}

export async function getCampaignById(id) {
  await connectDB();
  return Campaign.findById(id).lean();
}

export async function addCampaign(data) {
  await connectDB();
  return Campaign.create(data);
}

export async function updateCampaign(id, data) {
  await connectDB();
  return Campaign.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
}
