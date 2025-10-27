// src/models/Adoption.js
import mongoose from "mongoose";

const AdoptionSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  applicant: {
    name: String,
    email: String,
    phone: String,
    city: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Adoption = mongoose.models.Adoption || mongoose.model("Adoption", AdoptionSchema);

export default Adoption;
