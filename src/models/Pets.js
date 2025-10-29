import mongoose from "mongoose";

const PetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ["Dog","Cat","Bird","Rabbit","Other"], required: true },
    breed: { type: String, default: "" },
    ageMonths: { type: Number, default: 0 },
    size: { type: String, enum: ["Small","Medium","Large"], default: "Medium" },
    gender: { type: String, enum: ["Male","Female","Unknown"], default: "Unknown" },
    vaccinated: { type: Boolean, default: false },
    spayedNeutered: { type: Boolean, default: false },
    goodWithKids: { type: Boolean, default: false },
    description: { type: String, default: "" },
    photos: [{ type: String }],               // store URLs
    shelterId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelter" },
    status: { type: String, enum: ["available","pending","adopted","inactive"], default: "available" },
  },
  { timestamps: true }
);

export default mongoose.models.Pet || mongoose.model("Pet", PetSchema);